import { NextRequest, NextResponse } from "next/server";
import ConnectDB from "@/config/ConnectDB";
import NotificationsModel from "@/models/NotificationsModel";
import { getUserIdFromRequest } from "@/utils/server/getUserFromToken";
import UserModel from "@/models/UserModel";
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
    try {
        await ConnectDB();

        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Fetch the list of users the current user has disabled
        const user = await UserModel.findById(userId).select("disabledNotificationUsers");
        const disabledSenders = user?.disabledNotificationUsers || [];

        // Fetch notifications where sender is NOT in the disabled list
        const allNotifications = await NotificationsModel.find({
            receiver: userId,
            sender: { $nin: disabledSenders },
        })
            .sort({ createdAt: -1 })
            .populate("sender", "name image") // Populate sender's name and image
            .lean();

        const notificationsFlat = allNotifications.map((notification) => ({
            _id: notification._id,
            type: notification.type,
            sender: notification.sender?._id || "", // ID of sender
            receiver: notification.receiver,
            name: notification.sender?.name || "", // Sender's name
            image: notification.sender?.image || "", // Sender's image
            post: notification.post || null,
            slot: notification.slot || null,
            message: notification.message,
            isRead: notification.isRead,
            isClicked: notification.isClicked,
            isDisable: false, // You can set this to false, or use your own logic
            createdAt: notification.createdAt.toISOString(), // Ensure it's in string format
        }));

        return NextResponse.json({ data: notificationsFlat, success: true }, { status: 200 });

    } catch (err) {
        console.log("GET /notifications error:", err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// ? To update isClicked and isRead
export async function POST(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        const field = searchParams.get("field");
        const value = searchParams.get("value");
        const notificationId = searchParams.get("notificationId");

        // Validate required parameters
        if (!field || !value || !notificationId) {
            return NextResponse.json({ message: "Missing required fields: field, value, or notificationId." }, { status: 400 });
        }

        // Validate 'field' and 'value' parameters
        if (!["isRead", "isClicked"].includes(field)) {
            return NextResponse.json({ message: "Invalid field." }, { status: 400 });
        }

        if (value !== "true" && value !== "false") {
            return NextResponse.json({ message: "Invalid value. Must be 'true' or 'false'." }, { status: 400 });
        }

        const booleanValue = value === "true";

        // Find and update the notification
        const updatedNotification = await NotificationsModel.findByIdAndUpdate(
            notificationId,
            { [field]: booleanValue },
            { new: true, runValidators: true }
        );

        if (!updatedNotification) {
            return NextResponse.json({ message: "Notification not found." }, { status: 404 });
        }

        return NextResponse.json({ message: "Notification updated successfully.", updatedNotification, success: true }, { status: 200 });
    } catch (error) {
        console.error("Error updating notification:", error);
        return NextResponse.json({ message: "Internal server error." }, { status: 500 });
    }
}

// ? PUT api from NotifyChangeDialog.tsx
export async function PUT(req: NextRequest) {
    try {
        await ConnectDB();

        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { senderId } = await req.json();

        if (!mongoose.Types.ObjectId.isValid(senderId)) {
            return NextResponse.json({ success: false, message: "Invalid senderId" }, { status: 400 });
        }

        const user = await UserModel.findById(userId);

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        const isDisable = user.disabledNotificationUsers.some((id: string) =>
            id.toString() === senderId
        );

        if (isDisable) {
            // Remove senderId from the array
            await UserModel.findByIdAndUpdate(userId, {
                $pull: { disabledNotificationUsers: senderId }
            });
            return NextResponse.json({ success: true, isDisable: !isDisable, message: "Notifications enabled for this user." });
        } else {
            // Add senderId to the array
            await UserModel.findByIdAndUpdate(userId, {
                $addToSet: { disabledNotificationUsers: senderId }
            });
            return NextResponse.json({ success: true, isDisable: !isDisable, message: "Notifications disabled for this user." });
        }
    } catch (err) {
        console.log("UPDATE /notifications error:", err);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}

// ? DELETE api from NotifyChangeDialog.tsx
export async function DELETE(req: NextRequest) {
    try {
        await ConnectDB();

        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { notificationId } = await req.json();

        if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
            return NextResponse.json({ success: false, message: 'Invalid notification ID' }, { status: 400 });
        }

        // Ensure the notification belongs to the user
        const notification = await NotificationsModel.findOne({ _id: notificationId, receiver: userId });

        if (!notification) {
            return NextResponse.json({ success: false, message: 'Notification not found or unauthorized' }, { status: 404 });
        }

        await NotificationsModel.findByIdAndDelete(notificationId);

        return NextResponse.json({ success: true, message: 'Notification deleted successfully' });
    } catch (error) {
        console.log('DELETE /notification error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}