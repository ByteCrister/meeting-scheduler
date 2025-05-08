import ConnectDB from "@/config/ConnectDB";
import { ChatBoxModel, IChatBox } from "@/models/ChatBoxModel";
import UserModel, { IUserFollowInfo } from "@/models/UserModel";
import { getUserIdFromRequest } from "@/utils/server/getUserFromToken";
import { getUserSocketId } from "@/utils/socket/socketUserMap";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await ConnectDB();
        const currentUserId = await getUserIdFromRequest(req);
        if (!currentUserId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const currentUser = await UserModel.findById(currentUserId, "followers following");
        const chatBox = await ChatBoxModel.findOne({ ownerId: currentUserId }).lean() as IChatBox | null;

        if (!currentUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Merge follower and following IDs
        const followerIds = currentUser.followers?.map((f: IUserFollowInfo) => f.userId.toString()) ?? [];
        const followingIds = currentUser.following?.map((f: IUserFollowInfo) => f.userId.toString()) ?? [];
        const userIds = [...new Set([...followerIds, ...followingIds])]; // Unique IDs

        const userList = await Promise.all(
            userIds.map(async (userId) => {
                const user = await UserModel.findById(userId, "username email image").lean() as {
                    _id: string | Types.ObjectId;
                    username: string;
                    email: string;
                    image: string;
                } | null;

                if (!user) return null;

                // Find unseen message count from chatBox
                const chat = chatBox?.chats.find(c => c.participant.toString() === userId);
                const newUnseenMessages = chat?.messages.filter(msg => !msg.seen).length ?? 0;

                const online = Boolean(getUserSocketId(userId));

                return {
                    _id: user._id.toString(),
                    username: user.username,
                    email: user.email,
                    image: user.image,
                    newUnseenMessages,
                    online,
                };
            })
        );

        const filteredList = userList.filter(Boolean); // Remove nulls
        return NextResponse.json({ success: true, data: filteredList }, { status: 200 });

    } catch (error) {
        console.error("[GET_CHATBOX_USER_LIST]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}