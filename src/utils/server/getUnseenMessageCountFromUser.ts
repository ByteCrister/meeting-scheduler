import { ChatBoxModel } from "@/models/ChatBoxModel";
import { Types } from "mongoose";

/**
 * Returns the count of unseen messages from a specific owner to the current user.
 * @param currentUserId - The ID of the user receiving messages.
 * @param ownerId - The ID of the sender whose chatbox holds the messages.
 */
export async function getUnseenMessageCountFromUser(
  currentUserId: string,
  ownerId: string
): Promise<number> {
  if (!Types.ObjectId.isValid(currentUserId) || !Types.ObjectId.isValid(ownerId)) {
    return 0;
  }

  const unseenCount = await ChatBoxModel.aggregate([
    {
      $match: {
        [`participants.${currentUserId}`]: { $exists: true },
        ownerId: new Types.ObjectId(ownerId)
      }
    },
    {
      $project: {
        chats: `$participants.${currentUserId}.chats`
      }
    },
    { $unwind: "$chats" },
    {
      $match: {
        "chats.seen": false
      }
    },
    {
      $count: "totalUnseen"
    }
  ]);

  return unseenCount?.[0]?.totalUnseen || 0;
}