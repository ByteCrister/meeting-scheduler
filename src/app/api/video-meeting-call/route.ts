import ConnectDB from "@/config/ConnectDB";
import VideoCallModel, { IVideoCallStatus } from "@/models/VideoCallModel";
import { getUserIdFromRequest } from "@/utils/server/getUserFromToken";
import { getUserSocketId } from "@/utils/socket/socketUserMap";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { parse } from 'date-fns';
import SlotModel from "@/models/SlotModel";

export interface IParticipant {
    userId: mongoose.Types.ObjectId | string;
    socketId: string;
    isMuted: boolean;
    isVideoOn: boolean;
    joinedAt: Date;
}

// Function to detect time format and parse
const parseTime = (timeString: string, referenceDate: Date): Date => {
    // Try parsing time in 24-hour format first (e.g., "14:30")
    const time24 = parse(timeString, 'HH:mm', referenceDate);
    if (!isNaN(time24.getTime())) {
        return time24;
    }

    // If 24-hour format fails, try parsing in 12-hour format with AM/PM (e.g., "2:30 PM")
    const time12 = parse(timeString, 'hh:mm a', referenceDate);
    if (!isNaN(time12.getTime())) {
        return time12;
    }

    throw new Error('Invalid time format'); // Handle invalid time format
};


// ? creating a video call
export async function POST(req: NextRequest) {
    try {
        await ConnectDB();

        const body = await req.json();
        const { meetingId } = body;

        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        if (!meetingId) {
            return NextResponse.json({ message: 'meetingId is required' }, { status: 400 });
        }

        // Get the slot data to calculate start/end times
        const slot = await SlotModel.findById(meetingId);
        if (!slot) {
            return NextResponse.json({ message: 'Slot not found' }, { status: 404 });
        }

        // Parse the time strings into Date objects
        const meetingDate = new Date(slot.meetingDate); // Get the base meeting date
        const startTime = parseTime(slot.durationFrom, meetingDate); // Parse start time
        const endTime = parseTime(slot.durationTo, meetingDate); // Parse end time

        const socketId = getUserSocketId(userId);

        const newCall = await VideoCallModel.create({
            meetingId,
            hostId: userId,
            participants: [
                {
                    userId,
                    socketId,
                    isMuted: false,
                    isVideoOn: true,
                    joinedAt: new Date(),
                }
            ],
            status: IVideoCallStatus.ACTIVE,
            startTime,
            endTime,
            chatMessages: [],
            settings: {
                allowScreenShare: true,
                allowWaitingRoom: false,
                allowPrivateChat: true,
            },
        });

        return NextResponse.json({ success: true, videoCall: newCall }, { status: 201 });
    } catch (error) {
        console.log('[VIDEO_CALL_POST_ERROR]', error);
        return NextResponse.json({ message: 'Failed to create video call' }, { status: 500 });
    }
}


// ? update states of video meeting
export async function PUT(req: NextRequest) {

    try {
        await ConnectDB();
        // Parse the incoming request body
        const body = await req.json();
        const { isMuted, isVideoOn, isScreenSharing, message, meetingId } = body;
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Find the meeting by meetingId
        const videoCall = await VideoCallModel.findOne({ meetingId });

        if (!videoCall) {
            return NextResponse.json(
                { message: 'Meeting not found' },
                { status: 404 }
            );
        }

        // Find the participant in the video call
        const participantIndex = videoCall.participants.findIndex(
            (participant: IParticipant) => participant.userId.toString() === userId
        );

        if (participantIndex === -1) {
            return NextResponse.json(
                { message: 'Participant not found in the meeting' },
                { status: 404 }
            );
        }

        // Update the participant's settings
        const updatedParticipant = videoCall.participants[participantIndex];
        if (isMuted !== undefined) updatedParticipant.isMuted = isMuted;
        if (isVideoOn !== undefined) updatedParticipant.isVideoOn = isVideoOn;
        if (isScreenSharing !== undefined) updatedParticipant.isScreenSharing = isScreenSharing;

        // Update the chat messages if there's a new message
        if (message) {
            videoCall.chatMessages.push({
                userId,
                message,
                timestamp: new Date(),
            });
        }

        // Save the updated video call
        await videoCall.save();

        return NextResponse.json(
            { success: true, message: 'Video call updated successfully', videoCall },
            { status: 200 }
        );
    } catch (error) {
        console.log('Error updating video call:', error);
        return NextResponse.json(
            { error: 'An error occurred while updating the video call' },
            { status: 500 }
        );
    }
};