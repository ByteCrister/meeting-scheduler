import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/utils/server/getUserFromToken';
import ConnectDB from '@/config/ConnectDB';
import UserModel, { IUserFollowInfo } from '@/models/UserModel';
import SlotModel, { ISlot } from '@/models/SlotModel';


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
        const searchedPost = req.nextUrl.searchParams.get('meeting-post');
        console.log(page);


        const user = await UserModel.findById(userId);
        if (!user) return NextResponse.json([], { status: 200 });

        const followedIds = user.following.map((f: IUserFollowInfo) => f.userId);

        const baseQuery: {
            status: ISlot["status"];
            $expr: { $gt: [string, { $size: string }] };
            ownerId?: { $in: string[] };
        } = {
            status: 'upcoming',
            $expr: { $gt: ["$guestSize", { $size: "$bookedUsers" }] },
        };

        if (user.following.length > 5) {
            baseQuery.ownerId = { $in: followedIds };
        } else {
            const fallbackUsers = await UserModel.find({ profession: user.profession })
                .sort({ searchScore: -1 })
                .limit(limit);

            const fallbackIds = fallbackUsers.map(u => u._id.toString());
            baseQuery.ownerId = {
                $in: [...followedIds, ...fallbackIds],
            };
        }

        // Fetch feed slots
        const slots = await SlotModel.find(baseQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('ownerId', 'username image _id timeZone');

        // If searchedPost exists...
        if (page === 1 && searchedPost) {
            const index = slots.findIndex(slot => slot._id.toString() === searchedPost);

            // If found, move to top
            if (index > 0) {
                const [foundSlot] = slots.splice(index, 1);
                slots.unshift(foundSlot);
            }

            // If NOT found, fetch separately and prepend
            else if (index === -1) {
                const extraSlot = await SlotModel.findOne({
                    _id: searchedPost,
                    status: 'upcoming',
                    $expr: { $gt: ["$guestSize", { $size: "$bookedUsers" }] },
                }).populate('ownerId', 'username image _id timeZone');

                if (extraSlot) {
                    slots.unshift(extraSlot);
                }
            }
        }

        // Map to feed format
        const feedArray = slots.map(slot => ({
            _id: slot._id,
            title: slot.title,
            description: slot.description,
            meetingDate: slot.meetingDate,
            createdAt: slot.createdAt,
            durationFrom: slot.durationFrom,
            durationTo: slot.durationTo,
            guestSize: slot.guestSize,
            tags: slot.tags,
            bookedUsers: slot.bookedUsers,
            owner: {
                owner_id: slot.ownerId._id,
                username: slot.ownerId.username,
                image: slot.ownerId.image,
                timeZone: slot.ownerId.timeZone
            },
            isBooking: false,
        }));

        return NextResponse.json({ success: true, data: feedArray }, { status: 200 });

    } catch (err) {
        console.error('Feed Fetch Error:', err);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
};