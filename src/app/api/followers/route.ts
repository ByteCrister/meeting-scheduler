import ConnectDB from "@/config/ConnectDB";
import UserModel, { IUserFollowInfo } from "@/models/UserModel";
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

        // Use findOne to check if both users exist at once
        const [currentUser, targetUser] = await Promise.all([
            UserModel.findById(currentUserId).select("followers"),
            UserModel.findById(followerId).select("following")
        ]);


        if (!currentUser || !targetUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Prevent duplicate following
        // Check if the current user is already following the target user
        if (currentUser.followers.some((f: IUserFollowInfo) => f.userId.toString() === followerId.toString())) {
            return NextResponse.json({ message: "This user is already in your followers list" }, { status: 400 });
        }


        // Add to following/followers
        currentUser.followers.push({ userId: followerId, startedFrom: new Date() });
        targetUser.following.push({ userId: currentUserId, startedFrom: new Date() });

        // Save both users efficiently in parallel
        await Promise.all([currentUser.save(), targetUser.save()]);

        // Prepare and return the success response
        return NextResponse.json({
            message: "Successfully restored the follower.",
            data: {
                id: targetUser._id,
                title: targetUser.title,
                image: targetUser.image,
                isRemoved: false,
                idLoading: false,
            },
            success: true
        }, { status: 200 });

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


        // Use findOneAndUpdate for atomic operation to remove the follower from both users
        const [updatedCurrentUser, updatedTargetUser] = await Promise.all([
            UserModel.findOneAndUpdate(
                { _id: currentUserId },
                { $pull: { followers: { userId: followerId } } },
                { new: true } // Return updated document
            ),
            UserModel.findOneAndUpdate(
                { _id: followerId },
                { $pull: { following: { userId: currentUserId } } },
                { new: true } // Return updated document
            ),
        ]);

        if (!updatedCurrentUser || !updatedTargetUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Follower removed successfully", success: true }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}