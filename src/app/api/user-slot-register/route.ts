import ConnectDB from '@/config/ConnectDB';
import { getIOInstance } from '@/utils/socket/setIOInstance';
import NotificationsModel, { INotificationType } from '@/models/NotificationsModel';
import SlotModel, { ISlot } from '@/models/SlotModel';
import UserModel from '@/models/UserModel';
import { RegisterSlotStatus } from '@/types/client-types';
import { SocketTriggerTypes } from '@/utils/constants';
import { getUserIdFromRequest } from '@/utils/server/getUserFromToken';
import { getUserSocketId } from '@/utils/socket/socketUserMap';
import { NextRequest, NextResponse } from 'next/server';

// ? Get API from Slots.tsx
export async function GET(req: NextRequest) {
    try {
        await ConnectDB();

        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Find the user and populate registered slot references
        const user = await UserModel.findById(userId).populate('registeredSlots');

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const registeredSlots: ISlot[] = user.registeredSlots.map((slot: ISlot) => ({
            _id: slot._id as string,
            title: slot.title,
            category: slot.category,
            description: slot.description,
            tags: slot.tags,
            durationFrom: slot.durationFrom,
            durationTo: slot.durationTo,
            meetingDate: slot.meetingDate,
            guestSize: slot.guestSize,
            bookedUsers: slot.bookedUsers,
            trendScore: slot.trendScore,
            engagementRate: slot.engagementRate,
            status: slot.status,
            createdAt: slot.createdAt,
            updatedAt: slot.updatedAt
        }));

        return NextResponse.json({ success: true, data: registeredSlots }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

// ? Post API to create or update any slot
export async function POST(req: NextRequest) {
    try {
        await ConnectDB();

        const type = req.nextUrl.searchParams.get("type");
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const rawData = await req.json();
        const data = { ...rawData };

        // Clean up unnecessary props
        ['_id', 'createdAt', 'updatedAt'].forEach(prop => {
            if (prop in data) {
                delete data[prop];
            }
        });

        const io = getIOInstance();

        if (type === "create") {
            // 1. Create new slot
            const newSlot = await SlotModel.create({
                ...data,
                ownerId: userId,
            });

            // 2. Update user's registeredSlots
            await UserModel.findByIdAndUpdate(userId, {
                $push: { registeredSlots: newSlot._id },
            });

            // 3. Notify followers
            const user = await UserModel.findById(userId).select("followers image");
            const now = new Date();
            const baseNotification = {
                type: INotificationType.SLOT_CREATED,
                sender: userId,
                message: `New meeting slot "${newSlot.title}" just dropped!`,
                isRead: false,
                isClicked: false,
                createdAt: now,
                expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
            };

            if (user?.followers?.length && io) {
                await Promise.all(
                    user.followers.map(async (followerId: string) => {
                        const notification = { ...baseNotification, receiver: followerId };
                        const notificationDoc = new NotificationsModel(notification);
                        const saved = await notificationDoc.save();

                        // ? Incrementing count of new notification by 1+ for each followers
                        await UserModel.findByIdAndUpdate(followerId, { $inc: { countOfNotifications: 1 } }, { new: true });

                        const socketId = getUserSocketId(followerId);
                        if (socketId) {
                            io.to(socketId).emit(SocketTriggerTypes.RECEIVED_NOTIFICATION, {
                                userId: followerId,
                                notificationData: {
                                    ...notification,
                                    _id: saved._id,
                                    senderImage: user.image,
                                },
                            });
                        }
                    })
                );
            }

            return NextResponse.json({
                message: "Slot created and followers notified.",
                success: true,
                slot: newSlot,
            });

        } else if (type === "update") {

            const existingSlot = await SlotModel.findOne({ _id: data._id, ownerId: userId });
            if (!existingSlot) {
                return NextResponse.json({ message: "Slot not found or forbidden" }, { status: 404 });
            }

            const updatedSlot = await SlotModel.findByIdAndUpdate(data._id, data, { new: true });

            // Notify booked users (not followers)
            const user = await UserModel.findById(userId).select("image");

            const now = new Date();
            const baseNotification = {
                type: INotificationType.SLOT_UPDATED,
                sender: userId,
                message: `Meeting slot "${updatedSlot?.title}" was updated.`,
                isRead: false,
                isClicked: false,
                createdAt: now,
                expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
            };

            if (updatedSlot?.bookedUsers?.length && io) {
                await Promise.all(
                    updatedSlot.bookedUsers.map(async (bookedUserId: string) => {
                        const notification = { ...baseNotification, receiver: bookedUserId };
                        const saved = await NotificationsModel.create(notification);

                        // ? Incrementing count of new notification by 1+ for each user's who booked the meeting slot
                        await UserModel.findByIdAndUpdate(bookedUserId, { $inc: { countOfNotifications: 1 } }, { new: true });

                        const socketId = getUserSocketId(bookedUserId);
                        if (socketId) {
                            io.to(socketId).emit(SocketTriggerTypes.RECEIVED_NOTIFICATION, {
                                userId: bookedUserId,
                                notificationData: {
                                    ...notification,
                                    _id: saved._id,
                                    senderImage: user?.image,
                                },
                            });
                        }
                    })
                );
            }

            return NextResponse.json({
                message: "Slot updated and users notified.",
                success: true,
                slot: updatedSlot,
            });

        } else {
            return NextResponse.json({ message: "Invalid type parameter" }, { status: 400 });
        }

    } catch (error) {
        console.log("[Slot Create/Update Error]", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

// ? Delete API
export async function DELETE(req: NextRequest) {
    try {
        await ConnectDB();
        const body = await req.json();
        const { slotId } = body;

        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // getting user for image
        const user = await UserModel.findById(userId).select("image");

        // Delete the slot if the user owns it
        const slot = await SlotModel.findOne({ _id: slotId });
        if (!slot) {
            return NextResponse.json({ message: "Slot not found" }, { status: 404 });
        }

        if (slot.ownerId.toString() !== userId) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        // Delete slot
        await SlotModel.findByIdAndDelete(slotId);

        // Update user's registeredSlots
        await UserModel.updateOne(
            { _id: userId },
            { $pull: { registeredSlots: slotId } }
        );

        // ! Notification block
        if (slot.status === RegisterSlotStatus.Upcoming) { // * (Condition) - notify booked users only if the meeting slot delete before meeting starts 
            // 1. Notify "CANCEL message" to the user's who booked this meeting slot 
            const now = new Date();
            const sendNewNotification = {
                type: INotificationType.SLOT_DELETED,
                sender: userId, // Me - booked a meeting slot
                // receiver: slot.ownerId, // User who booked this meeting slot, will be added on the loop
                message: `Meeting of ${slot.title} is cancelled.`,
                isRead: false,
                isClicked: false,
                createdAt: now,
                expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
            };

            // Emit meeting cancel notification to the user's who booked this meeting slot.
            const io = getIOInstance();
            if (slot.bookedUsers.length && io) {
                await Promise.all(
                    slot.bookedUsers.map(async (bookedUserId: string) => {
                        const notificationData = { ...sendNewNotification, receiver: bookedUserId };
                        const notificationDoc = new NotificationsModel(notificationData);
                        const savedNotification = await notificationDoc.save();

                        // ? Incrementing count of new notification by 1+ for each user's who booked the meeting slot
                        await UserModel.findByIdAndUpdate( bookedUserId, { $inc: { countOfNotifications: 1 } }, { new: true } );

                        const socketId = getUserSocketId(bookedUserId);
                        if (socketId) {
                            io.to(socketId).emit(SocketTriggerTypes.RECEIVED_NOTIFICATION, {
                                userId: bookedUserId,
                                notificationData: {
                                    ...sendNewNotification,
                                    _id: savedNotification._id,
                                    senderImage: user?.image,
                                },
                            });
                        } else {
                            console.log(`User ${bookedUserId} is not currently connected.`);
                        }
                    })
                );
            }
        }


        return NextResponse.json({ message: "Slot deleted successfully", success: true }, { status: 200 });
    } catch (error) {
        console.error("Delete Slot Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}