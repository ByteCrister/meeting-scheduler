import { ChatBoxModel } from "@/models/ChatBoxModel";
import { Types } from "mongoose";

/**
 * Updates or creates a chatbox for the given owner and participant, and stores a message in the participant's chat history.
 *
 * If the chatbox already exists, the message is added to the corresponding participant's chats,
 * and the `lastParticipants` field is updated.
 * If the chatbox doesn't exist, it creates a new one for the given participants and the message.
 * 
 * @param ownerId - The ID of the chatbox owner (the user who owns the chatbox).
 * @param participantId - The ID of the participant who is receiving the message.
 * @param message - The message object containing the message's `_id`, `senderId`, `message`, `time`, and `seen` status.
 */
export async function updateUserChatBox(
    ownerId: string,
    participantId: string,
    message: {
        _id: Types.ObjectId;
        senderId: string;
        message: string;
        time: Date;
        seen: boolean;
    }
): Promise<void> {
    // Find the chatbox by ownerId
    const chatBox = await ChatBoxModel.findOne({ ownerId });

    // Define the path to the participant's chat history in the chatbox
    const participantPath = `participants.${participantId}.chats`;

    // If the chatbox exists, push the new message and update the last participant
    if (chatBox) {
        await ChatBoxModel.updateOne(
            { ownerId },
            {
                $push: { [participantPath]: message }, // Add the new message to the participant's chat list
                $set: { lastParticipants: participantId }, // Update the last participant to the current participant
            }
        );
    } else {
        // If the chatbox doesn't exist, create a new one with the message
        await ChatBoxModel.create({
            ownerId, // Owner of the chatbox
            participants: {
                [participantId]: { // Add the participant and their chat history
                    chats: [message], // Initialize with the first message
                },
            },
            lastParticipants: participantId, // Set the last participant
        });
    }
}
