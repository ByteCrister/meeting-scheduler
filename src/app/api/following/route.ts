import ConnectDB from "@/config/ConnectDB";
import UserModel from "@/models/UserModel";
import { getUserIdFromRequest } from "@/utils/server/getUserFromToken";
import { NextRequest, NextResponse } from "next/server";
import { IFriendTypes, IPopulatedFriendTypes } from "../followers/route";
import NotificationsModel, { INotificationType } from "@/models/NotificationsModel";
import { getIOInstance } from "@/utils/socket/setIOInstance";
import { getUserSocketId } from "@/utils/socket/socketUserMap";
import { SocketTriggerTypes } from "@/utils/constants";

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
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { followingFriendId } = await req.json();
        if (!followingFriendId) return NextResponse.json({ error: "Missing target user ID" }, { status: 400 });

        // Prevent following self
        if (userId === followingFriendId) {
            return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 });
        }

        const currentUser = await UserModel.findById(userId);
        const targetUser = await UserModel.findById(followingFriendId);

        if (!currentUser || !targetUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Check if already following
        const alreadyFollowing = currentUser.following.some((entry: { userId: string }) => entry.userId.toString() === followingFriendId
        );

        if (alreadyFollowing) {
            return NextResponse.json({ message: "Already following" }, { status: 200 });
        }

        // Add to current user's following list
        currentUser.following.push({ userId: followingFriendId, startedFrom: new Date() });

        // Add to target user's followers list
        targetUser.followers.push({ userId: userId, startedFrom: new Date() });

        await currentUser.save();
        await targetUser.save();

        const sendNewNotification = {
            type: INotificationType.FOLLOW,
            sender: userId, // Me - started following
            receiver: targetUser._id, // User whom I followed
            message: `${currentUser.username} started following you.`,
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
            senderImage: currentUser?.image,
        };

        // emit notification to the owner's account
        const socketId = getUserSocketId(targetUser._id); // Get specific socket
        if (socketId) {
            io.to(socketId).emit(SocketTriggerTypes.RECEIVED_NOTIFICATION, {
                userId: targetUser._id,
                notificationData
            });
        }

        return NextResponse.json({ message: "Followed successfully", success: true }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// ? Unfollow any user
export async function DELETE(req: NextRequest) {
    try {
        await ConnectDB();
        const currentUserId = await getUserIdFromRequest(req);
        if (!currentUserId) return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });

        const { followingFriendId } = await req.json();
        if (!followingFriendId) return NextResponse.json({ message: "Missing target user ID", success: false }, { status: 400 });

        const currentUser = await UserModel.findById(currentUserId);
        const targetUser = await UserModel.findById(followingFriendId);

        if (!currentUser || !targetUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Remove from following
        currentUser.following = currentUser.following.filter(
            (entry: { userId: string }) => entry.userId.toString() !== followingFriendId
        );

        // Remove from followers
        targetUser.followers = targetUser.followers.filter(
            async (entry: { userId: string }) => entry.userId.toString() !== await currentUserId
        );

        await currentUser.save();
        await targetUser.save();

        // * Delete notification msg if user had been following before
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