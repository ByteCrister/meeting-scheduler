import mongoose, { Schema, Types, Document } from "mongoose";

// Message structure
export interface IMessageEntry {
    _id?: Types.ObjectId;
    message: string;
    createdAt: Date;
    seen: boolean; // Whether the owner (ownerId) has seen this message
    senderId: Types.ObjectId;
}

// Chat entry with a participant
export interface IChatEntry {
    participant: Types.ObjectId;
    chatId: Types.ObjectId;
    messages: IMessageEntry[];
    lastSeenAt?: Date;
}

export interface IChatBox extends Document {
    ownerId: Types.ObjectId;
    chats: IChatEntry[];
}

const MessageEntrySchema = new Schema<IMessageEntry>(
    {
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        seen: { type: Boolean, default: false }, // Owner-specific seen status
        senderId: { type: Schema.Types.ObjectId, ref: "users", required: true }, // NEW FIELD
    },
    { _id: true }
);

const ChatEntrySchema = new Schema<IChatEntry>(
    {
        participant: { type: Schema.Types.ObjectId, ref: "users", required: true },
        chatId: { type: Schema.Types.ObjectId, ref: "chatbox", required: true },
        messages: [MessageEntrySchema],
        lastSeenAt: { type: Date }, // Optional, helps compute unseen messages fast
    },
    { _id: true }
);

const ChatBoxSchema = new Schema<IChatBox>(
    {
        ownerId: { type: Schema.Types.ObjectId, ref: "users", required: true },
        chats: [ChatEntrySchema],
    },
    { timestamps: true }
);

export const ChatBoxModel = mongoose.models.chatbox || mongoose.model<IChatBox>("chatbox", ChatBoxSchema);
