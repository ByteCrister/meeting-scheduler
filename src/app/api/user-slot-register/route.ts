import ConnectDB from '@/config/ConnectDB';
import NotificationsModel, { INotificationType } from '@/models/NotificationsModel';
import SlotModel, { ISlot } from '@/models/SlotModel';
import UserModel, { IUserFollowInfo } from '@/models/UserModel';
import { RegisterSlotStatus } from '@/types/client-types';
import { SocketTriggerTypes } from '@/utils/constants';
import { getUserIdFromRequest } from '@/utils/server/getUserFromToken';
import { NextRequest, NextResponse } from 'next/server';
import { triggerSocketEvent } from '@/utils/socket/triggerSocketEvent';
import getNotificationExpiryDate from '@/utils/server/getNotificationExpiryDate';

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
};

// ? Post for create or update any slot
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

        // ? Send notification to the followers of creating a new meeting slot. 
        if (type === "create") {
            // Create new slot
            const newSlot = await SlotModel.create({
                ...data,
                ownerId: userId,
            });

            if (!newSlot) {
                return NextResponse.json({ message: "Failed to create slot" }, { status: 500 });
            }

            // Update user's registeredSlots
            await UserModel.findByIdAndUpdate(userId, {
                $push: { registeredSlots: newSlot._id },
            });

            // Notify followers
            const user = await UserModel.findById(userId).select("followers image");
            const now = new Date();
            const baseNotification = {
                type: INotificationType.SLOT_CREATED,
                sender: userId,
                message: `New meeting slot "${newSlot.title}" just dropped!`,
                isRead: false,
                isClicked: false,
                createdAt: now,
                expiresAt: getNotificationExpiryDate(30), // 30 days
            };

            // ? Send notification to the followers.
            if (user?.followers?.length) {
                await Promise.all(
                    user.followers.map(async (follower: IUserFollowInfo) => {
                        const followerId = follower.userId.toString();
                        const notification = { ...baseNotification, receiver: followerId };
                        const notificationDoc = new NotificationsModel(notification);
                        const saved = await notificationDoc.save();

                        // ? Incrementing count of new notification by +1 for each followers
                        await UserModel.findByIdAndUpdate(followerId, { $inc: { countOfNotifications: 1 } }, { new: true });
                        // ! Emit a notification to the followers about the meeting slot      
                        triggerSocketEvent({
                            userId: followerId.toString(),
                            type: SocketTriggerTypes.RECEIVED_NOTIFICATION,
                            notificationData: {
                                ...notification,
                                _id: saved._id,
                                image: user.image,
                            },
                        });
                    })
                );
            }

            return NextResponse.json({
                message: "Slot created and followers notified.",
                success: true,
                slot: newSlot,
            });

            // ?  Send update notification of meeting slot to the user's who booked the meeting
        } else if (type === "update") {

            const existingSlot = await SlotModel.findOne({ _id: rawData._id, ownerId: userId });
            if (!existingSlot) {
                return NextResponse.json({ message: "Slot not found or forbidden" }, { status: 404 });
            }

            const updatedSlot = await SlotModel.findByIdAndUpdate(rawData._id, data, { new: true });

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
                expiresAt: getNotificationExpiryDate(30), // 30 days
            };

            // ? Send notifications to the booked users
            if (updatedSlot?.bookedUsers?.length) {
                await Promise.all(
                    updatedSlot.bookedUsers.map(async (bookedUserId: string) => {
                        const notification = { ...baseNotification, receiver: bookedUserId };
                        const saved = await NotificationsModel.create(notification);

                        // ? Incrementing count of new notification by 1+ for each user's who booked the meeting slot
                        await UserModel.findByIdAndUpdate(bookedUserId, { $inc: { countOfNotifications: 1 } }, { new: true });

                        // ! Emit a notification to booked users about the updated slot
                        triggerSocketEvent({
                            userId: bookedUserId.toString(),
                            type: SocketTriggerTypes.RECEIVED_NOTIFICATION,
                            notificationData: {
                                ...notification,
                                _id: saved._id.toString(),
                                slot: updatedSlot._id.toString(),
                                image: user?.image,
                            },
                        });
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
};

// ? Delete registered meeting slot 
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

        // * Delete slot
        await SlotModel.findByIdAndDelete(slotId);

        // * Update owners's registeredSlots
        await UserModel.updateOne(
            { _id: userId },
            { $pull: { registeredSlots: slotId } }
        );

        // * Remove the deleted slot from all users' bookedSlots
        await UserModel.updateMany(
            { 'bookedSlots.slotId': slotId },
            { $pull: { bookedSlots: { slotId } } }
        );

        // ? If meeting status is upcoming, that means the meeting is still valid and have to send notification to the user's who booked this meeting slot.
        // * (Condition) - will true only if delete API request hit before meeting starts
        if (slot.status === RegisterSlotStatus.Upcoming) {
            // * Notify "CANCEL message" to the user's who booked this meeting slot 
            const now = new Date();
            const sendNewNotification = {
                type: INotificationType.SLOT_DELETED,
                sender: userId, // Me - Was created a meeting slot.
                message: `Meeting of ${slot.title} is cancelled.`,
                isRead: false,
                isClicked: false,
                createdAt: now,
                expiresAt: getNotificationExpiryDate(30), // 30 days
            };

            // * Executes only if anyone booked this meeting 
            if (slot.bookedUsers.length) {
                await Promise.all(
                    slot.bookedUsers.map(async (bookedUserId: string) => {
                        // ! Notification block
                        const notificationData = { ...sendNewNotification, receiver: bookedUserId.toString() }; // * The user who booked this slot
                        const notificationDoc = new NotificationsModel(notificationData);
                        const savedNotification = await notificationDoc.save();

                        // ? Incrementing count of new notification by +1 for each user's who booked this meeting
                        await UserModel.findByIdAndUpdate(bookedUserId, { $inc: { countOfNotifications: 1 } }, { new: true });

                        // ! Emit a notification to the users who have been booked this meeting slot       
                        triggerSocketEvent({
                            userId: bookedUserId.toString(),
                            type: SocketTriggerTypes.RECEIVED_NOTIFICATION,
                            notificationData: {
                                ...sendNewNotification,
                                _id: savedNotification._id,
                                image: user?.image,
                            },
                        });
                    })
                );
            }
        };

        return NextResponse.json({ message: "Slot deleted successfully", success: true }, { status: 200 });
    } catch (error) {
        console.error("Delete Slot Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
};