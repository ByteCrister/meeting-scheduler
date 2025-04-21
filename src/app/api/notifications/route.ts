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

        // Parse pagination
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const skip = (page - 1) * limit;

        // Fetch notifications where sender is NOT in the disabled list
        const allNotifications = await NotificationsModel.find({
            receiver: userId,
            sender: { $nin: disabledSenders },
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const notificationsWithFlag = allNotifications.map((notification) => ({
            ...notification,
            isDisabled: false
        }));

        return NextResponse.json({ data: notificationsWithFlag, success: true }, { status: 200 });
    } catch (err) {
        console.log("GET /notifications error:", err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// ? PUT api from NotificationChangeDialog.tsx
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

// ? DELETE api from NotificationChangeDialog.tsx
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