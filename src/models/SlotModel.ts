import mongoose, { Schema, Document } from "mongoose";

export enum IRegisterStatus {
    Upcoming = "upcoming",
    Ongoing = "ongoing",
    Completed = "completed",
    Expired = "expired"
}

// * Slot interface
export interface ISlot extends Document {
    ownerId?: string; // User who created this slot
    title: string;
    category: string;
    description: string;
    meetingDate: Date;
    tags: string[];
    durationFrom: string;
    durationTo: string;
    guestSize: number;
    bookedUsers: string[]; // Array of userIds
    trendScore: number;
    engagementRate: number;
    status: "upcoming" | "ongoing" | "completed" | "expired";
    createdAt: Date;
    updatedAt: Date;
}

// * Slot schema
const SlotSchema = new Schema<ISlot>(
    {
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
            index: true, // For fast filtering by owner
        },
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
        },
        meetingDate: {
            type: Date,
            required: true,
        },
        tags: [
            {
                type: String,
            },
        ],
        durationFrom: {
            type: String,
            required: true,
        },
        durationTo: {
            type: String,
            required: true,
        },
        guestSize: {
            type: Number,
            required: true,
            min: [1, "Guest size must be at least 1"],
        },
        bookedUsers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "users",
            },
        ],
        trendScore: {
            type: Number,
            default: 0,
            min: 0,
        },
        engagementRate: {
            type: Number,
            default: 0,
            min: 0,
        },
        status: {
            type: String,
            enum: IRegisterStatus,
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// * Model export
const SlotModel = mongoose.models.slots || mongoose.model<ISlot>("slots", SlotSchema);
export default SlotModel;
