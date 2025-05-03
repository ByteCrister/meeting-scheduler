import ConnectDB from "@/config/ConnectDB";
import UserModel from "@/models/UserModel";
import { getUserIdFromRequest } from "@/utils/server/getUserFromToken";
import { NextRequest, NextResponse } from "next/server";
import { IFriendTypes, IPopulatedFriendTypes } from "../followers/route";
import NotificationsModel, { INotificationType } from "@/models/NotificationsModel";
import { SocketTriggerTypes } from "@/utils/constants";
import { triggerSocketEvent } from "@/utils/socket/triggerSocketEvent";
import getNotificationExpiryDate from "@/utils/server/getNotificationExpiryDate";

// ? Get peoples that I follow
export async function GET(req: NextRequest) {
    try {
        await ConnectDB();
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await UserModel.findById(userId).populate({
            path: "following.userId",
            select: "_id username title image",
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const following: IFriendTypes[] = (
            user.following as IPopulatedFriendTypes[]
        ).map((f) => ({
            id: f.userId._id.toString(),
            name: f.userId.username,
            title: f.userId.title,
            image: f.userId.image,
            isRemoved: false,
        }));

        return NextResponse.json(
            { success: true, data: following },
            { status: 200 }
        );
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// ? Follow other users
export async function POST(req: NextRequest) {
    try {
        await ConnectDB();
        const userId = await getUserIdFromRequest(req);
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { followingFriendId } = await req.json();
        if (!followingFriendId) return NextResponse.json({ message: "Missing target user ID" }, { status: 400 });

        // Prevent following self
        if (userId === followingFriendId) {
            return NextResponse.json({ message: "You cannot follow yourself" }, { status: 400 });
        }

        // Fetch both users concurrently to optimize
        const [currentUser, targetUser] = await Promise.all([
            UserModel.findById(userId),
            UserModel.findById(followingFriendId)
        ]);;

        if (!currentUser || !targetUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Check if already following
        const alreadyFollowing = currentUser.following.some((entry: { userId: string }) => entry.userId.toString() === followingFriendId.toString());

        if (alreadyFollowing) {
            return NextResponse.json({ message: "Already following" }, { status: 200 });
        }

        // Add to current user's following list
        currentUser.following.push({ userId: followingFriendId, startedFrom: new Date() });

        // Add to target user's followers list
        targetUser.followers.push({ userId: userId, startedFrom: new Date() });

        // Save both users' data in parallel
        await Promise.all([currentUser.save(), targetUser.save()]);

        // * New Notification Object 
        const sendNewNotification = {
            type: INotificationType.FOLLOW,
            sender: userId, // Me - started following a user
            receiver: targetUser._id, // User whom I started following
            message: `${currentUser.username} started following you.`,
            isRead: false,
            isClicked: false,
            createdAt: new Date(),
            expiresAt: getNotificationExpiryDate(30), // 30 days
        };
        // * Notification is pushed and saved to collection
        const notificationDoc = new NotificationsModel(sendNewNotification);
        const savedNotification = await notificationDoc.save();

        // ? Incrementing count of unseen notifications by +1 to the followed person
        await UserModel.findByIdAndUpdate(targetUser._id, { $inc: { countOfNotifications: 1 } }, { new: true });

        // * --------------- socket -------------------
        // ! Emit a notification to the owner of the slot        
        triggerSocketEvent({
            userId: targetUser._id.toString(),
            type: SocketTriggerTypes.RECEIVED_NOTIFICATION,
            notificationData: {
                ...sendNewNotification,
                _id: savedNotification._id,
                image: currentUser?.image,
            },
        });

        // ? Prepare following user data to send back
        const followingUser = {
            id: targetUser._id.toString(),
            name: targetUser.username,
            title: targetUser.title,
            image: targetUser.image,
            isRemoved: false,
        }

        return NextResponse.json({ message: "Followed successfully", data: followingUser, success: true }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// ? Unfollow any user, the persons who you followed
export async function DELETE(req: NextRequest) {
    try {
        await ConnectDB();

        const currentUserId = await getUserIdFromRequest(req);
        if (!currentUserId) {
            return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
        }

        const { followingFriendId } = await req.json();
        if (!followingFriendId) {
            return NextResponse.json({ message: "Missing target user ID", success: false }, { status: 400 });
        }

        const [currentUser, targetUser] = await Promise.all([
            UserModel.findById(currentUserId).select("_id"), // only need _id to verify existence
            UserModel.findById(followingFriendId).select("_id"),
        ]);

        if (!currentUser || !targetUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Unfollow logic: Remove current user from target user's followers, and target user from current user's following
        const [currentUserUpdate, targetUserUpdate] = await Promise.all([
            UserModel.updateOne(
                { _id: currentUserId },
                { $pull: { following: { userId: followingFriendId } } }
            ),
            UserModel.updateOne(
                { _id: followingFriendId },
                { $pull: { followers: { userId: currentUserId } } }
            ),
        ]);

        // Check if updates were successful
        if (currentUserUpdate.modifiedCount === 0 || targetUserUpdate.modifiedCount === 0) {
            return NextResponse.json({ message: "Unfollow failed", success: false }, { status: 400 });
        }

        // Optionally delete follow notifications for this action
        await NotificationsModel.deleteMany({
            sender: currentUserId,
            receiver: followingFriendId,
            type: INotificationType.FOLLOW,
        });

        return NextResponse.json({ message: "Unfollowed successfully", success: true }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}