import ConnectDB from "@/config/ConnectDB";
import UserModel from "@/models/UserModel";
import { getUserIdFromRequest } from "@/utils/server/getUserFromToken";
import { NextRequest, NextResponse } from "next/server";

export interface IPopulatedFriendTypes {
    userId: {
        _id: string;
        username: string;
        title: string;
        image: string;
    };
    startedFrom: Date;
}

export interface IFriendTypes {
    id: string;
    name: string;
    title: string;
    image: string;
    isRemoved: boolean;
}


// ? Get followers
export async function GET(req: NextRequest) {
    try {
        await ConnectDB();
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await UserModel.findById(userId).populate({
            path: "followers.userId",
            select: "_id username title image",
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const followers: IFriendTypes[] = (user.followers as IPopulatedFriendTypes[]).map(f => ({
            id: f.userId._id.toString(),
            name: f.userId.username,
            title: f.userId.title,
            image: f.userId.image,
            isRemoved: false,
            isLoading: false
        }));

        return NextResponse.json({ success: true, data: followers }, { status: 200 });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}


// ? Unremoved a follower, suppose I have just removed a follower from my list but now I want undo.
export async function PUT(req: NextRequest) {
    try {
        await ConnectDB();

        const currentUserId = await getUserIdFromRequest(req);
        if (!currentUserId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        // ? The user who followed me
        const { followerId } = await req.json();
        if (!followerId) return NextResponse.json({ message: "Missing target user ID" }, { status: 400 });

        if (currentUserId === followerId) {
            return NextResponse.json({ message: "You can't follow yourself" }, { status: 400 });
        }

        const currentUser = await UserModel.findById(currentUserId);
        const targetUser = await UserModel.findById(followerId);

        if (!currentUser || !targetUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Prevent duplicate following
        const alreadyFollowing = currentUser.following.some((f: { userId: string }) => f.userId.toString() === followerId);
        if (alreadyFollowing) {
            return NextResponse.json({ message: "Already following" }, { status: 400 });
        }

        // Add to following/followers
        currentUser.followers.push({ userId: followerId, startedFrom: new Date() });
        targetUser.following.push({ userId: currentUserId, startedFrom: new Date() });

        await currentUser.save();
        await targetUser.save();

        return NextResponse.json({ message: "Successfully follower returned.", data: { id: targetUser._id, title: targetUser.title, image: targetUser.image, isRemoved: false, idLoading: false }, success: true }, { status: 200 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}


// ? Remove follower, persons who followed you
export async function DELETE(req: NextRequest) {
    try {
        await ConnectDB();

        const currentUserId = await getUserIdFromRequest(req);
        if (!currentUserId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { followerId } = await req.json();
        if (!followerId) {
            return NextResponse.json({ message: "Missing target user ID" }, { status: 400 });
        }

        // Ensure both users exist (can be skipped if you're confident)
        const [currentUser, targetUser] = await Promise.all([
            UserModel.findById(currentUserId).select("_id"),
            UserModel.findById(followerId).select("_id"),
        ]);
        if (!currentUser || !targetUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Atomically remove each other from the relevant lists
        await Promise.all([
            UserModel.updateOne(
                { _id: currentUserId },
                { $pull: { followers: { userId: followerId } } }
            ),
            UserModel.updateOne(
                { _id: followerId },
                { $pull: { following: { userId: currentUserId } } }
            ),
            // NotificationsModel.deleteMany({
            //     sender: followerId,
            //     receiver: currentUserId,
            //     type: INotificationType.FOLLOW,
            // }),
        ]);

        return NextResponse.json({ message: "Follower removed successfully", success: true }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}