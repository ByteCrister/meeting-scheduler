import mongoose, { Document, Schema } from 'mongoose';

export interface IVideoCall extends Document {
    meetingId: mongoose.Types.ObjectId | string;
    hostId: mongoose.Types.ObjectId | string;
    participants: {
        userId: mongoose.Types.ObjectId | string;
        socketId: string;
        isMuted: boolean;
        isVideoOn: boolean;
        joinedAt: Date;
    }[];
    status: 'waiting' | 'active' | 'ended';
    startTime: Date;
    endTime?: Date;
    chatMessages: {
        userId: mongoose.Types.ObjectId | string;
        message: string;
        timestamp: Date;
    }[];
    settings: {
        allowScreenShare: boolean;
        allowWaitingRoom: boolean;
        allowPrivateChat: boolean;
    };
}

export enum IVideoCallStatus {
    WAITING = 'waiting',
    ACTIVE = 'active',
    ENDED = 'ended',
    LEAVED = 'leaved',
}

const VideoCallSchema = new Schema<IVideoCall>(
    {
        meetingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'slots',
            required: true,
            index: true,
        },
        hostId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },
        participants: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users',
                required: true,
            },
            socketId: {
                type: String,
                required: true,
            },
            isMuted: {
                type: Boolean,
                default: false,
            },
            isVideoOn: {
                type: Boolean,
                default: true,
            },
            joinedAt: {
                type: Date,
                default: Date.now,
            },
        }],
        status: {
            type: String,
            enum: Object.values(IVideoCallStatus),
            default: IVideoCallStatus.WAITING,
        },
        startTime: {
            type: Date,
            default: Date.now,
        },
        endTime: {
            type: Date,
        },
        chatMessages: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users',
                required: true,
            },
            message: {
                type: String,
                required: true,
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
        }],
        settings: {
            allowScreenShare: {
                type: Boolean,
                default: true,
            },
            allowWaitingRoom: {
                type: Boolean,
                default: false,
            },
            allowPrivateChat: {
                type: Boolean,
                default: true,
            },
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const VideoCallModel = mongoose.models.videoCalls || mongoose.model<IVideoCall>('videoCalls', VideoCallSchema);
export default VideoCallModel; 