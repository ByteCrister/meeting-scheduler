import ConnectDB from "@/config/ConnectDB";
import { ChatBoxModel, IChatBox, IMessage } from "@/models/ChatBoxModel";
import UserModel, { IUsers } from "@/models/UserModel";
import { ApiChatBoxMessageType, SocketTriggerTypes } from "@/utils/constants";
import { getUnseenMessageCountFromUser } from "@/utils/server/getUnseenMessageCountFromUser";
import { getUserIdFromRequest } from "@/utils/server/getUserFromToken";
import { resetUnseenMessageCount } from "@/utils/server/resetUnseenMessageCount";
import { updateUserChatBox } from "@/utils/server/updateUserChatBox";
import { getUserSocketId } from "@/utils/socket/socketUserMap";
import { triggerSocketEvent } from "@/utils/socket/triggerSocketEvent";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await ConnectDB();

        const { searchParams } = new URL(req.url);
        const selectedFriendId = searchParams.get("selectedFriendId");
        const type = searchParams.get("type") || ApiChatBoxMessageType.GET_ACTIVE_USER;

        const currentUserId = await getUserIdFromRequest(req);
        if (!currentUserId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const currentUserChatBox = await ChatBoxModel.findOne({ ownerId: currentUserId }).lean<IChatBox>();
        const selectedUserChatBox = selectedFriendId
            ? await ChatBoxModel.findOne({ ownerId: selectedFriendId }).lean<IChatBox>()
            : null;

        // Handle GET_MESSAGES
        if (type === ApiChatBoxMessageType.GET_MESSAGES) {
            if (!selectedFriendId) {
                return NextResponse.json({ message: "selectedFriendId is required for GET_MESSAGES" }, { status: 400 });
            }

            const selectedUser = await UserModel.findById(selectedFriendId, "username image").lean();
            if (!selectedUser) {
                return NextResponse.json({ message: "Selected user not found" }, { status: 404 });
            }

            const currentUserChats = currentUserChatBox?.participants?.[selectedFriendId]?.chats || [];
            const friendUserChats = selectedUserChatBox?.participants?.[currentUserId.toString()]?.chats || [];

            const allChats = [...currentUserChats, ...friendUserChats];

            const formattedChats = allChats
                .map((msg) => ({
                    _id: msg._id?.toString() ?? crypto.randomUUID(),
                    message: msg.message,
                    createdAt: new Date(msg.time).toISOString(),
                    user_id: currentUserChats.includes(msg)
                        ? currentUserId.toString()
                        : selectedFriendId,
                }))
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

            return NextResponse.json({ success: true, data: formattedChats }, { status: 200 });
        }

        // Handle GET_ACTIVE_USER
        let selectedUser: { _id: string; username: string; image: string } | null = null;

        if (selectedFriendId) {
            selectedUser = await UserModel.findById(selectedFriendId, "username image").lean() as { _id: string; username: string; image: string } | null;
        }

        if (!selectedUser && currentUserChatBox?.lastParticipants) {
            selectedUser = await UserModel.findById(currentUserChatBox.lastParticipants, "username image").lean() as { _id: string; username: string; image: string } | null;
        }

        if (!selectedUser && currentUserChatBox) {
            const latestParticipantId = Object.keys(currentUserChatBox.participants || {}).sort((a, b) => {
                const aChats = currentUserChatBox.participants[a]?.chats || [];
                const bChats = currentUserChatBox.participants[b]?.chats || [];
                const aTime = aChats.at(-1)?.time ?? new Date(0);
                const bTime = bChats.at(-1)?.time ?? new Date(0);
                return bTime.getTime() - aTime.getTime();
            })[0];

            if (latestParticipantId) {
                selectedUser = await UserModel.findById(latestParticipantId, "username image").lean() as { _id: string; username: string; image: string } | null;
            }
        }

        if (!selectedUser) {
            const currentUser = await UserModel.findById(currentUserId, "following").lean<IUsers>();
            const firstFollowedUserId = currentUser?.following?.[0]?.userId;
            if (firstFollowedUserId) {
                selectedUser = await UserModel.findById(firstFollowedUserId, "username image").lean() as { _id: string; username: string; image: string } | null;
            }
        }

        if (!selectedUser) {
            return NextResponse.json({ message: "No user found" }, { status: 404 });
        }

        // Update the lastParticipants field in the chatbox
        if (currentUserChatBox && !currentUserChatBox.lastParticipants) {
            await ChatBoxModel.updateOne(
                { currentUserId },
                {
                    $set: { lastParticipants: selectedUser._id }
                },
            );
        }

        const unseenMessagesCount = await getUnseenMessageCountFromUser(currentUserId, selectedUser._id)

        return NextResponse.json({
            success: true,
            count: unseenMessagesCount,
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

        const { participantsId, message } = await req.json();

        if (!participantsId || !message) {
            return NextResponse.json({ message: "Invalid data" }, { status: 400 });
        }

        const isParticipantOnline = getUserSocketId(participantsId) ? true : false;
        const lastChattedUserOfParticipants = await ChatBoxModel.findOne({ ownerId: participantsId, lastParticipants: currentUserId });
        const isSenderIsLastParticipant = lastChattedUserOfParticipants?.lastParticipants?.toString() === currentUserId.toString();
        const isParticipantsChatBoxOpened = lastChattedUserOfParticipants?.isChatBoxOpened;
        const isSenderIsLastParticipantAndChatBoxOpened = isSenderIsLastParticipant && isParticipantsChatBoxOpened;
        const isSeen = isParticipantOnline && isSenderIsLastParticipantAndChatBoxOpened;

        const newMessage = {
            _id: new Types.ObjectId(),
            senderId: currentUserId,
            message,
            time: new Date(),
            seen: isSeen,
        };

        const responseMessage = {
            _id: newMessage._id,
            message: newMessage.message,
            createdAt: newMessage.time,
            user_id: currentUserId,
        };

        // Save message only in sender's chatbox
        await updateUserChatBox(currentUserId, participantsId, newMessage);

        // Trigger socket to send message
        triggerSocketEvent({
            userId: participantsId,
            type: SocketTriggerTypes.SEND_NEW_CHAT_MESSAGE,
            notificationData: responseMessage
        });

        // Notify participant if they are online but chatbox is closed
        if (!isParticipantsChatBoxOpened && isParticipantOnline && isSenderIsLastParticipant) {
            triggerSocketEvent({
                userId: participantsId,
                type: SocketTriggerTypes.INCREASE_UNSEEN_MESSAGE_COUNT,
                notificationData: null
            });
        }

        return NextResponse.json({ success: true, message: "Message sent", data: responseMessage });
    } catch (error) {
        console.error("[POST_CHAT_MESSAGE]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { type, participantId, isOpened } = body;

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
                // Update the sender's message "seen" status in recipient's chatBox
                await resetUnseenMessageCount(participantId, currentUserId);
                return NextResponse.json({ success: true, message: "Unseen messages reset" });

            case ApiChatBoxMessageType.TOGGLE_IS_CHATBOX_OPEN:
                if (isOpened === undefined) {
                    return NextResponse.json({ message: "isOpened parameter is required" }, { status: 400 });
                }
                // Update the chatbox open/close status
                await ChatBoxModel.updateOne({ ownerId: currentUserId }, { $set: { isChatBoxOpened: isOpened } });
                return NextResponse.json({ success: true, message: "Chatbox status updated" });


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

        const chatBox = await ChatBoxModel.findOne({ ownerId: currentUserId });
        if (!chatBox) {
            return NextResponse.json({ message: 'Chatbox not found' }, { status: 404 });
        }

        const userChats: IMessage[] = chatBox.participants?.[participantId]?.chats;
        if (!userChats || userChats.length === 0) {
            return NextResponse.json({ message: 'No messages found with participant' }, { status: 404 });
        }

        const updatedChats = userChats.filter(
            (msg) => !msg._id?.equals(messageId)
        );

        if (updatedChats.length === userChats.length) {
            return NextResponse.json({ message: 'Message not found' }, { status: 404 });
        }

        // Update the participant's message array
        chatBox.participants[participantId].chats = updatedChats;
        await chatBox.save();

        // Notify recipient to delete message from UI (optional since they don’t store it)
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