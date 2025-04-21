import { NextRequest, NextResponse } from "next/server";

import NotificationsModel, { INotificationType } from "@/models/NotificationsModel";
import ConnectDB from "@/config/ConnectDB";
import { getUserIdFromRequest } from "@/utils/server/getUserFromToken";
import SlotModel, { IRegisterStatus } from "@/models/SlotModel";
import UserModel, { IUsers } from "@/models/UserModel";
import { formatUTCDateToOffset } from "@/utils/client/date-convertions/formatUTCDateToOffset";
import { getConvertedTime } from "@/utils/client/date-convertions/convertDateTime";
import { getIOInstance } from "@/utils/socket/setIOInstance";
import { getUserSocketId } from "@/utils/socket/socketUserMap";
import { SocketTriggerTypes } from "@/utils/constants";

// ? Get request for booked page fetchData API
export const GET = async (req: NextRequest) => {
    try {

        await ConnectDB();

        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await UserModel.findById(userId).lean<IUsers>();
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // get user bookedSlots. Meeting slots that user booked
        const slotIds = user?.bookedSlots.map(slot => slot.slotId) ?? [];

        const slots = await SlotModel.find({ _id: { $in: slotIds } })
            .sort({ createdAt: -1 }) // sort by latest createdAt
            .lean();

        // get all unique ownerIds
        const ownerIds = [...new Set(slots.map(slot => slot.ownerId?.toString()))].filter(Boolean);

        // fetch all creators
        const owners = await UserModel.find({ _id: { $in: ownerIds } }, '_id username').lean();
        const ownerMap: Record<string, string> = {};
        owners.forEach(owner => {
            ownerMap[(owner._id as string).toString()] = owner.username;
        });

        // final formatted data
        const formattedData = slots.map((slot) => {
            const creatorId = slot.ownerId?.toString() || '';
            return {
                _id: (slot._id as string).toString(),
                title: slot.title,
                category: slot.category,
                description: slot.description,
                meetingDate: formatUTCDateToOffset(slot.meetingDate, user.timeZone),
                tags: slot.tags,
                durationFrom: getConvertedTime(slot.meetingDate, slot.durationFrom, user.timeZone),
                durationTo: getConvertedTime(slot.meetingDate, slot.durationFrom, user.timeZone),
                status: slot.status,
                creatorId,
                creator: ownerMap[creatorId] || 'Unknown',
            };
        });

        return NextResponse.json({ success: true, data: formattedData }, { status: 200 });
    } catch (error) {
        console.log('[GET USER SLOT BOOKING ERROR]', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

// ? Post request to booked a meeting slot
export async function POST(req: NextRequest,) {

    try {
        await ConnectDB();
        // 1: Get user id
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // 2: Get slot id
        const { slotId } = await req.json();

        // 3: Get the slot
        const slot = await SlotModel.findById(slotId);
        if (!slot) return NextResponse.json({ message: "Slot not found" }, { status: 404 });

        // Check if slot already fill up or not
        if (slot.bookedUsers.length === slot.guestSize) {
            return NextResponse.json({ message: "All slots are booked!" }, { status: 400 });
        }

        // Check if user already booked this slot
        if (slot.bookedUsers.includes(userId)) {
            return NextResponse.json({ message: "Already booked!" }, { status: 400 });
        }


        // 4: Getting user for image
        const user = await UserModel.findById(userId).select("image");

        // 5: Update user model
        await UserModel.findByIdAndUpdate(userId, {
            $push: {
                bookedSlots: {
                    userId,
                    slotId: slot._id,
                    status: IRegisterStatus.Upcoming,
                },
            },
        });

        // 6: Update slot with this user
        slot.bookedUsers.push(userId);
        await slot.save();

        // ! Notification block
        // 7: Notify the owner of this slot
        const sendNewNotification = {
            type: INotificationType.SLOT_BOOKED,
            sender: userId, // Me - booked a meeting slot
            receiver: slot.ownerId, // Owner of the meeting slot
            message: "Someone booked your meeting slot.",
            isRead: false,
            isClicked: false,
            createdAt: new Date()
        };
        const NewNotification = await NotificationsModel.create(sendNewNotification);
        const savedNotification = await NewNotification.save();

        // Emit via shared socket instance
        const io = getIOInstance();

        // Emit a notification to the owner of the slot
        const notificationData = {
            ...sendNewNotification,
            _id: savedNotification._id,
            senderImage: user?.image,
        };

        // 8: emit notification to the slot owner's account
        const socketId = getUserSocketId(slot.ownerId); // Get specific socket
        if (socketId) {
            io.to(socketId).emit(SocketTriggerTypes.RECEIVED_NOTIFICATION, {
                userId: slot.ownerId,
                notificationData
            });
        }

        // 9: Notify all followers of the slot owner
        const slotOwner = await UserModel.findById(slot.ownerId).select("followers");

        if (slotOwner?.followers?.length) {
            const followersToNotify = slotOwner.followers;

            const userSlotBookedData = {
                type: SocketTriggerTypes.USER_SLOT_BOOKED,
                sender: userId, // user who booked the slot
                slotId: slot._id,
            };

            followersToNotify.forEach((followerId: string) => {
                const followerSocketId = getUserSocketId(followerId.toString());
                if (followerSocketId) {
                    io.to(followerSocketId).emit(SocketTriggerTypes.USER_SLOT_BOOKED, userSlotBookedData);
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: 'You successfully booked this meeting slot!'
        }, { status: 201 });
    } catch (err) {
        console.log("[BOOK SLOT ERROR]", err);
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
    }
};

// ? Delete on AlertDeleteBookedSlot to delete any booked slot
export async function DELETE(req: NextRequest) {
    try {
        await ConnectDB();

        // 1: Get user id
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // 2: Get slot id
        const { slotId } = await req.json();
        if (!slotId) {
            return NextResponse.json({ success: false, message: "slotId is required" }, { status: 400 });
        }

        // 3: Update users bookedSlot array, remove the slotId
        const updatedUser = await UserModel.findOneAndUpdate(
            { _id: userId },
            { $pull: { bookedSlots: { slotId } } },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        // 4: Update bookedUsers from slot owners, remove userId
        const slot = await SlotModel.findOneAndUpdate(
            { _id: slotId },
            { $pull: { bookedUsers: { userId } } },
            { new: true }
        );

        if (!slot) {
            return NextResponse.json({ success: false, message: "Slot not found. Slot may be removed by the owner." }, { status: 404 });
        }

        // 5: Notify other users who follow the slot owner, that one guest is removed **Only if the meeting is still upcoming
        if (slot.status !== IRegisterStatus.Upcoming) {
            // Notify all followers of the slot owner
            const slotOwner = await UserModel.findById(slot.ownerId).select("followers");
            // Emit via shared socket instance
            const io = getIOInstance();
            if (slotOwner?.followers?.length) {
                const followersToNotify = slotOwner.followers;

                const userSlotBookedData = {
                    type: SocketTriggerTypes.USER_SLOT_UNBOOKED,
                    sender: userId, // user who booked the slot
                    slotId: slot._id,
                };

                followersToNotify.forEach((followerId: string) => {
                    const followerSocketId = getUserSocketId(followerId.toString());
                    if (followerSocketId) {
                        io.to(followerSocketId).emit(SocketTriggerTypes.USER_SLOT_UNBOOKED, userSlotBookedData);
                    }
                });
            }
        }

        return NextResponse.json({ success: true, message: "Slot deleted successfully" });
    } catch (error) {
        console.error("[DELETE_BOOKED_SLOT_ERROR]", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}