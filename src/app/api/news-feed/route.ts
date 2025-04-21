import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/utils/server/getUserFromToken';
import ConnectDB from '@/config/ConnectDB';
import UserModel, { IUserFollowInfo } from '@/models/UserModel';
import SlotModel from '@/models/SlotModel';
import { feedMapSlotType } from '@/types/server-types';
import { formatUTCDateToOffset } from '@/utils/client/date-convertions/formatUTCDateToOffset';
import { getConvertedTime } from '@/utils/client/date-convertions/convertDateTime';

export const GET = async (req: NextRequest) => {
    
    try {
        await ConnectDB();
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const page = parseInt(req.nextUrl.searchParams.get('page') || '1', 10);
        const limit = 5;
        const skip = (page - 1) * limit;
        const user = await UserModel.findById(userId);
        if (!user) return NextResponse.json([], { status: 200 });

        let query;

        const followedIds = user.following.map((f: IUserFollowInfo) => f.userId);
        if (user.following.length > 5) {
            query = { ownerId: { $in: followedIds }, status: 'upcoming' };
        } else if (user.following.length > 0) {
            const extra = await UserModel.find({ profession: user.profession })
                .sort({ searchScore: -1 })
                .limit(5 - followedIds.length);
            const richUserIds = extra.map(u => u._id.toString());
            query = {
                ownerId: { $in: [...followedIds, ...richUserIds] },
                status: 'upcoming'
            };
        } else {
            const richUsers = await UserModel.find({ profession: user.profession })
                .sort({ searchScore: -1 })
                .limit(5);
            const richUserIds = richUsers.map(u => u._id.toString());
            query = { ownerId: { $in: richUserIds }, status: 'upcoming' };
        }

        const slots = await SlotModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('ownerId', 'username image');

        const feedMap: { [slotId: string]: feedMapSlotType } = {};
        slots.forEach(slot => {
            feedMap[slot._id.toString()] = {
                _id: slot._id,
                title: slot.title,
                description: slot.description,
                meetingDate: formatUTCDateToOffset(slot.meetingDate, user.timeZone),
                createdAt: formatUTCDateToOffset(slot.createdAt, user.timeZone),
                durationFrom: getConvertedTime(slot.meetingDate, slot.durationFrom, user.timeZone),
                durationTo: getConvertedTime(slot.meetingDate, slot.durationTo, user.timeZone),
                guestSize: slot.guestSize,
                tags: slot.tags,
                bookedUsers: slot.bookedUsers,
                owner: {
                    username: slot.ownerId.username,
                    image: slot.ownerId.image,
                },
                isBooking: false,
            };
        });

        return NextResponse.json({ success: true, data: feedMap }, { status: 200 });
    } catch (err) {
        console.log(err);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
};