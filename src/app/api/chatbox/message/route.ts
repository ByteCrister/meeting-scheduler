import ConnectDB from "@/config/ConnectDB";
import { ChatBoxModel, IChatBox, IChatEntry, IMessageEntry } from "@/models/ChatBoxModel";
import UserModel from "@/models/UserModel";
import { ApiChatBoxMessageType, SocketTriggerTypes } from "@/utils/constants";
import { getUserIdFromRequest } from "@/utils/server/getUserFromToken";
import { triggerSocketEvent } from "@/utils/socket/triggerSocketEvent";
import { UpdateQuery } from "mongoose";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await ConnectDB();

        const { searchParams } = new URL(req.url);
        const selectedFriendId = searchParams.get("selectedFriendId");
        const type = searchParams.get("type");
        console.log(`${type} - ${selectedFriendId}`);

        const currentUserId = await getUserIdFromRequest(req);
        if (!currentUserId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const chatBox = await ChatBoxModel.findOne({ ownerId: currentUserId }).lean() as IChatBox | null;

        let selectedUser: { _id: string; username: string; image: string } | null = null;

        // If selectedFriendId is provided via query param
        if (selectedFriendId) {
            selectedUser = await UserModel.findById(selectedFriendId, "username image").lean() as {
                _id: string;
                username: string;
                image: string;
            } | null;
        }

        // Fallback: recent chat participant
        if (!selectedUser && chatBox && chatBox?.chats?.length > 0) {
            const latestChat = chatBox?.chats.reduce((latest, chat) => {
                const lastMessage = chat.messages.at(-1);
                const latestTime = latest?.messages.at(-1)?.createdAt ?? new Date(0);
                return lastMessage && lastMessage.createdAt > latestTime ? chat : latest;
            });

            if (latestChat) {
                selectedUser = await UserModel.findById(latestChat.participant, "username image").lean() as {
                    _id: string;
                    username: string;
                    image: string;
                } | null;
            }
        }

        // Fallback: first followed user
        if (!selectedUser) {
            const currentUser = await UserModel.findById(currentUserId, "following").lean() as {
                following?: { userId: string }[];
            } | null;
            const followingList = currentUser?.following ?? [];

            if (followingList.length > 0) {
                const firstFollowedUserId = followingList[0].userId;
                selectedUser = await UserModel.findById(firstFollowedUserId, "username image").lean() as {
                    _id: string;
                    username: string;
                    image: string;
                } | null;
            }
        }

        if (!selectedUser) {
            return NextResponse.json({ message: "No user found" }, { status: 404 });
        }

        if (type === ApiChatBoxMessageType.GET_MESSAGES) {
            const chatWithFriend = chatBox?.chats.find(chat =>
                chat.participant.toString() === selectedUser!._id.toString()
            );

            const formattedChats = chatWithFriend?.messages.map((msg) => ({
                _id: msg._id?.toString() ?? crypto.randomUUID(),
                message: msg.message,
                createdAt: msg.createdAt.toISOString(),
                user_id: msg.senderId?.toString(),
            })) ?? [];

            return NextResponse.json({ success: true, data: formattedChats }, { status: 200 });
        }

        return NextResponse.json({
            success: true,
            data: {
                _id: selectedUser._id.toString(),
                username: selectedUser.username,
                image: selectedUser.image,
            }
        }, { status: 200 });

    } catch (error) {
        console.error("[GET_CHATBOX]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await ConnectDB();
        const currentUserId = await getUserIdFromRequest(req);
        if (!currentUserId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { recipientId, message } = await req.json();

        if (!recipientId || !message) {
            return NextResponse.json({ message: "Invalid data" }, { status: 400 });
        }

        const newMessage = {
            _id: new Types.ObjectId(),
            senderId: currentUserId,
            message,
            createdAt: new Date(),
            seen: false,
        };
        const responseMessage = {
            _id: newMessage._id,
            message: newMessage.message,
            createdAt: newMessage.createdAt,
            user_id: currentUserId,
        };

        // Run sender + receiver updates in parallel
        await Promise.all([
            updateUserChatBox(currentUserId, recipientId, newMessage, true),   // sender
            updateUserChatBox(recipientId, currentUserId, newMessage, false), // receiver
        ]);

        triggerSocketEvent({
            userId: recipientId,
            type: SocketTriggerTypes.SEND_NEW_CHAT_MESSAGE,
            notificationData: responseMessage
        });

        return NextResponse.json({ success: true, message: "Message sent", data: responseMessage });
    } catch (error) {
        console.error("[POST_CHAT_MESSAGE]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { type, participantId } = body;

        const currentUserId = await getUserIdFromRequest(req);
        if (!currentUserId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        if (!type) {
            return NextResponse.json({ message: "Request type is required" }, { status: 400 });
        }

        switch (type) {
            case ApiChatBoxMessageType.RESET_UNSEEN_MESSAGE_COUNT:
                if (!participantId) {
                    return NextResponse.json({ message: "Participant ID required" }, { status: 400 });
                }
                await resetUnseenMessageCount(participantId, currentUserId);
                return NextResponse.json({ success: true, message: "Unseen messages reset" });

            // Add more cases here for other features
            // case "archive-chat":
            //     await archiveChat(participantId, currentUserId);
            //     return NextResponse.json({ success: true, message: "Chat archived" });

            default:
                return NextResponse.json({ message: `Unknown operation type: ${type}` }, { status: 400 });
        }
    } catch (error) {
        console.error("[PUT_CHATBOX_ACTION]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        await ConnectDB();
        const { participantId, messageId } = await req.json();

        const currentUserId = await getUserIdFromRequest(req);

        console.log(`${participantId} - ${messageId} - ${currentUserId}`);

        if (!currentUserId || !participantId || !messageId) {
            return NextResponse.json(
                { message: 'currentUserId, participantId, and messageId are required' },
                { status: 400 }
            );
        }

        if (
            !Types.ObjectId.isValid(currentUserId) ||
            !Types.ObjectId.isValid(participantId) ||
            !Types.ObjectId.isValid(messageId)
        ) {
            return NextResponse.json(
                { message: 'Invalid ObjectId provided' },
                { status: 400 }
            );
        }

        const currentUserObjectId = new Types.ObjectId(currentUserId);
        const participantObjectId = new Types.ObjectId(participantId);
        const messageObjectId = new Types.ObjectId(messageId);

        const chatBox = await ChatBoxModel.findOne({ ownerId: currentUserObjectId });
        if (!chatBox) {
            return NextResponse.json({ message: 'Chatbox not found' }, { status: 404 });
        }

        const chatEntry = chatBox.chats.find((chat: IChatEntry) => chat.participant.equals(participantObjectId));
        if (!chatEntry) {
            return NextResponse.json({ message: 'Chat with participant not found' }, { status: 404 });
        }

        const originalCount = chatEntry.messages.length;
        chatEntry.messages = chatEntry.messages.filter(
            (msg: IMessageEntry) => !msg._id?.equals(messageObjectId)
        );

        if (chatEntry.messages.length === originalCount) {
            return NextResponse.json({ message: 'Message not found in chat' }, { status: 404 });
        }

        await chatBox.save();

        // ? trigger delete message to participantId account
        triggerSocketEvent({
            userId: participantId,
            type: SocketTriggerTypes.DELETE_CHAT_MESSAGE,
            notificationData: messageId
        });

        return NextResponse.json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
        console.error('[DELETE_CHATBOX_MESSAGE]', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// ? Helper function for post request
async function updateUserChatBox(
    ownerId: string,
    participantId: string,
    message: {
        _id: Types.ObjectId;
        senderId: string;
        message: string;
        createdAt: Date;
        seen: boolean;
    },
    isSender: boolean
) {
    const existingChatBox = await ChatBoxModel.findOne({
        ownerId,
        "chats.participant": participantId,
    });

    if (existingChatBox) {
        // Type-safe update object
        const update: UpdateQuery<IChatBox> = {
            $push: { "chats.$.messages": { ...message, seen: isSender ? true : false } },
        };
        if (isSender) {
            update.$set = { "chats.$.lastSeenAt": new Date() };
        }

        await ChatBoxModel.updateOne(
            { ownerId, "chats.participant": participantId },
            update
        );
    } else {
        const newChat = {
            participant: participantId,
            chatId: new Types.ObjectId(),
            messages: [message],
            lastSeenAt: isSender ? new Date() : undefined,
        };

        await ChatBoxModel.updateOne(
            { ownerId },
            { $push: { chats: newChat } },
            { upsert: true }
        );
    }
}

// ? Helper function for pu request, to reset count of new unseen messages
async function resetUnseenMessageCount(participantId: string, currentUserId: string) {
    await ChatBoxModel.updateOne(
        {
            ownerId: new Types.ObjectId(currentUserId),
            "chats.participant": new Types.ObjectId(participantId),
        },
        {
            $set: {
                "chats.$[chat].messages.$[msg].seen": true,
                "chats.$[chat].lastSeenAt": new Date(),
            },
        },
        {
            arrayFilters: [
                { "chat.participant": new Types.ObjectId(participantId) },
                { "msg.seen": false },
            ],
        }
    );
};