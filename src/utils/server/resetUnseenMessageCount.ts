import { ChatBoxModel, IMessage } from "@/models/ChatBoxModel";

/**
 * Marks all messages as "seen" that were sent by the sender and received by the viewer.
 *
 * @param senderId - The ID of the message sender (i.e., the chat box owner).
 * @param viewerUserId - The ID of the user who is viewing the messages (i.e., the participant).
 */
export async function resetUnseenMessageCount(senderId: string, viewerUserId: string) {
    const chatBox = await ChatBoxModel.findOne({ ownerId: senderId });

    if (!chatBox) return;

    const participant = chatBox.participants.get(viewerUserId);
    if (!participant) return;

    participant.chats = participant.chats.map((chat: IMessage) => ({
        ...chat,
        seen: true,
    }));

    chatBox.participants.set(viewerUserId, participant); // re-set in map to ensure change is tracked
    await chatBox.save();
}
