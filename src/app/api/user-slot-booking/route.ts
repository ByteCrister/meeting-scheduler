import { NextRequest, NextResponse } from "next/server";

import NotificationsModel, { INotificationType } from "@/models/NotificationsModel";
import ConnectDB from "@/config/ConnectDB";
import { getUserIdFromRequest } from "@/utils/server/getUserFromToken";
import SlotModel, { IRegisterStatus } from "@/models/SlotModel";
import UserModel, { IUsers } from "@/models/UserModel";
import { formatUTCDateToOffset } from "@/utils/client/date-convertions/formatUTCDateToOffset";
import { getConvertedTime } from "@/utils/client/date-convertions/convertDateTime";
import { SocketTriggerTypes } from "@/utils/constants";
import { triggerSocketEvent } from "@/utils/socket/triggerSocketEvent";

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
};

// ? Post request to booked a meeting slot
export async function POST(req: NextRequest,) {

    try {
        await ConnectDB();

        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Get slot id
        const { slotId } = await req.json();

        //  Get the slot
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

        //  Getting user for image
        const user = await UserModel.findById(userId).select("image");

        // Update user model
        await UserModel.findByIdAndUpdate(userId, {
            $push: {
                bookedSlots: {
                    userId,
                    slotId: slot._id,
                    status: IRegisterStatus.Upcoming,
                },
            },
        });

        // Update slot with this user
        slot.bookedUsers.push(userId);
        await slot.save();

        // ! Notification block
        // Notify the owner of this slot
        const now = new Date();
        const sendNewNotification = {
            type: INotificationType.SLOT_BOOKED,
            sender: userId, // Me - booked a meeting slot
            receiver: slot.ownerId, // Owner of the meeting slot
            message: "Someone booked your meeting slot.",
            isRead: false,
            isClicked: false,
            createdAt: now,
            expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
        };
        const notificationDoc = new NotificationsModel(sendNewNotification);
        const savedNotification = await notificationDoc.save();
        // ? Incrementing count of new notification by 1+ for the meeting slot owner
        await UserModel.findByIdAndUpdate(slot.ownerId, { $inc: { countOfNotifications: 1 } }, { new: true });

        // emit notification to the slot owner's account
        triggerSocketEvent({
            userId: slot.ownerId.toString(),
            type: SocketTriggerTypes.RECEIVED_NOTIFICATION,
            notificationData: {
                ...sendNewNotification,
                _id: savedNotification._id,
                senderImage: user?.image,
            },
        });


        // Notify updated guest count to the all followers of the slot owner 
        // ? This will trigger in frontend & change the slot booked guest count, to show the current booked numbers in real-time 
        const slotOwner = await UserModel.findById(slot.ownerId).select("followers");

        // ? Only executes if the meeting slot owner has any followers.
        if (slotOwner?.followers?.length) {
            const followersToNotify = slotOwner.followers;

            const userSlotBookedData = {
                type: SocketTriggerTypes.USER_SLOT_BOOKED,
                sender: userId, // user who booked the slot
                slotId: slot._id,
            };

            followersToNotify.forEach((followerId: string) => {
                triggerSocketEvent({
                    userId: followerId.toString(),
                    type: SocketTriggerTypes.USER_SLOT_BOOKED,
                    notificationData: userSlotBookedData
                })
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

// ? Delete API to delete any booked slot
export async function DELETE(req: NextRequest) {
    try {
        await ConnectDB();

        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Get slot id
        const { slotId } = await req.json();
        if (!slotId) {
            return NextResponse.json({ success: false, message: "slotId is required" }, { status: 400 });
        }

        //  Update users bookedSlot array, remove the slotId
        const updatedUser = await UserModel.findOneAndUpdate(
            { _id: userId },
            { $pull: { bookedSlots: { slotId } } },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        // Update bookedUsers from slot owners, remove userId
        const slot = await SlotModel.findOneAndUpdate(
            { _id: slotId },
            { $pull: { bookedUsers: { userId } } },
            { new: true }
        );

        if (!slot) {
            return NextResponse.json({ success: false, message: "Slot not found. Slot may be removed by the owner." }, { status: 404 });
        }

        // !  Notify other users who follow the slot owner, that one guest is removed **Only if the meeting is still upcoming
        // ? This will trigger in frontend & change the slot booked guest count, to show the real-time guest booking number 
        if (slot.status !== IRegisterStatus.Upcoming) {
            // * Notify the booked user count number to all the followers of the slot owner
            const slotOwner = await UserModel.findById(slot.ownerId).select("followers");

            if (slotOwner?.followers?.length) {
                const followersToNotify = slotOwner.followers;

                const userSlotBookedData = {
                    type: SocketTriggerTypes.USER_SLOT_UNBOOKED,
                    sender: userId, // user who booked the slot
                    slotId: slot._id,
                };

                followersToNotify.forEach((followerId: string) => {
                    // ! Emit a notification to the follower of the slot owner. This emit is for showing the updated number of booked members in real-time       
                    triggerSocketEvent({
                        userId: followerId.toString(),
                        type: SocketTriggerTypes.USER_SLOT_UNBOOKED,
                        notificationData: userSlotBookedData,
                    });
                });
            }
        }

        return NextResponse.json({ success: true, message: "Slot deleted successfully" });
    } catch (error) {
        console.error("[DELETE_BOOKED_SLOT_ERROR]", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
};