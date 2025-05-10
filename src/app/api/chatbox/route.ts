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
        if (!currentUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const followerIds = currentUser.followers?.map((f: IUserFollowInfo) => f.userId.toString()) ?? [];
        const followingIds = currentUser.following?.map((f: IUserFollowInfo) => f.userId.toString()) ?? [];
        const userIds = [...new Set([...followerIds, ...followingIds])];

        // Fetch all users in one query
        const users = await UserModel.find(
            { _id: { $in: userIds } },
            "username email image"
        ).lean<{ _id: Types.ObjectId; username: string; email: string; image: string }[]>();

        const usersMap = new Map(users.map(u => [u._id.toString(), u]));

        // Fetch all chat boxes of those users
        const chatBoxes = await ChatBoxModel.find({
            ownerId: { $in: userIds },
        }).lean<IChatBox[]>();

        const chatBoxMap = new Map(chatBoxes.map(cb => [cb.ownerId.toString(), cb]));

        // Construct response
        const userList = userIds.map(userId => {
            const user = usersMap.get(userId);
            if (!user) return null;

            const chatBox = chatBoxMap.get(userId);
            const chatsFromThem = chatBox?.participants?.[currentUserId.toString()]?.chats ?? [];
            const newUnseenMessages = chatsFromThem.filter(msg => !msg.seen).length;

            return {
                _id: user._id.toString(),
                username: user.username,
                email: user.email,
                image: user.image,
                newUnseenMessages,
                online: Boolean(getUserSocketId(userId)),
            };
        }).filter(Boolean);

        return NextResponse.json({ success: true, data: userList }, { status: 200 });

    } catch (error) {
        console.error("[GET_CHATBOX_USER_LIST]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}