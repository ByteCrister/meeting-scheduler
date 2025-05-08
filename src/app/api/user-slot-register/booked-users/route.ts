import ConnectDB from '@/config/ConnectDB';
import SlotModel from '@/models/SlotModel';
import { Types } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        await ConnectDB();

        const url = new URL(req.url);
        const slotId = url.searchParams.get('slotId');

        if (!slotId || !Types.ObjectId.isValid(slotId)) {
            return NextResponse.json({ message: 'Valid slotId is required' }, { status: 400 });
        }

        const slot = await SlotModel.findById(slotId).populate('bookedUsers', 'username email image');

        if (!slot) {
            return NextResponse.json({ message: 'Slot not found' }, { status: 404 });
        }

        const formattedUsers = slot.bookedUsers.map((user: { _id: string, username: string, email: string, image: string }) => ({
            _id: user._id.toString(),
            username: user.username,
            email: user.email,
            image: user.image,
        }));

        return NextResponse.json({ success: true,  data: formattedUsers }, {status: 200});
    } catch (error) {
        console.error('[GET_BOOKED_USERS]', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
