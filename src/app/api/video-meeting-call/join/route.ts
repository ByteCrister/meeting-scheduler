import ConnectDB from '@/config/ConnectDB';
import VideoCallModel, { IVideoCallStatus } from '@/models/VideoCallModel';
import { NextRequest, NextResponse } from 'next/server';
import { IParticipant } from '../route';
import { getUserIdFromRequest } from '@/utils/server/getUserFromToken';
import { getUserSocketId } from '@/utils/socket/socketUserMap';

// ? Joining to a video meeting
export async function GET(req: NextRequest) {

    const { searchParams } = new URL(req.url);
    const meetingId = searchParams.get('meetingId');

    const userId = await getUserIdFromRequest(req);
    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const socketId = getUserSocketId(userId);

    if (!meetingId || !socketId) {
        return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
    }

    try {
        await ConnectDB();

        const videoCall = await VideoCallModel.findOne({ meetingId, status: IVideoCallStatus.ACTIVE });

        if (!videoCall) {
            return NextResponse.json({ message: 'Meeting not found or is not active' }, { status: 404 });
        }

        const alreadyJoined = videoCall.participants.some(
            (p: IParticipant) => String(p.userId) === String(userId)
        );

        if (!alreadyJoined) {
            videoCall.participants.push({
                userId,
                socketId,
                isMuted: false,
                isVideoOn: true,
                joinedAt: new Date(),
            });
            await videoCall.save();
        }

        return NextResponse.json({ message: 'Joined the call successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error joining video call:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

// ? Leaving from  a video meeting call
export async function DELETE(req: NextRequest) {
    try {
        await ConnectDB();

        const { searchParams } = new URL(req.url);
        const meetingId = searchParams.get('meetingId');
        const userId = await getUserIdFromRequest(req);

        if (!meetingId || !userId) {
            return NextResponse.json({ message: 'Missing meetingId or unauthorized' }, { status: 400 });
        }

        const updateResult = await VideoCallModel.updateOne(
            { meetingId },
            { $pull: { participants: { userId } } }
        );

        if (updateResult.modifiedCount === 0) {
            return NextResponse.json({ message: 'User not found in participants or meeting not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Left the call successfully' }, { status: 200 });
    } catch (error) {
        console.log('[LEAVE_VIDEO_CALL_ERROR]', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}