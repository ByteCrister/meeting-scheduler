import { NextRequest, NextResponse } from 'next/server';
import ConnectDB from '@/config/ConnectDB';
import UserModel from '@/models/UserModel';
import SlotModel from '@/models/SlotModel';
import { getUserIdFromRequest } from '@/utils/server/getUserFromToken';
import Fuse from 'fuse.js';
import { redisCache } from '@/utils/redis/redisCache';
import highlightMatch from '@/utils/server/highlightMatch';
import calculateRelevance from '@/utils/server/calculateRelevance';

interface RawUser {
    _id: string;
    username: string;
    email: string;
    profession: string;
    title: string;
    trendScore: number;
    searchScore: number;
    createdAt: string | Date;
}
interface RawSlot {
    _id: string;
    title: string;
    category: string;
    description: string;
    tags: string[];
    ownerId: string;
    bookedUsers: string[];
    guestSize: number;
    trendScore: number;
    engagementRate: number;
    createdAt: string | Date;
}
interface SearchResult {
    relevance: number;
    _id: string;
    name: string;
    matchedString: string;
    href: string;
    field: 'user' | 'slot';
}

// Utility to escape regex characters
function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, '\\$&'); // Escapes special characters
}

// Split query into individual tokens and create regex for each
function createSearchRegex(query: string): RegExp {
    const tokens = query.split(/\s+/).map(token => escapeRegExp(token));  // Split by spaces
    const pattern = tokens.join(".*"); // Allows for partial matching
    return new RegExp(pattern, 'i'); // Case-insensitive matching
}

export const GET = async (req: NextRequest) => {
    const { searchParams } = req.nextUrl;
    const query = searchParams.get('q')?.trim();

    const userId = await getUserIdFromRequest(req);
    if (!userId) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    if (!query) {
        return NextResponse.json({ success: false, message: 'Missing query parameter `q`' }, { status: 400 });
    }

    const cacheKey = `search:${query}`;
    const cached = await redisCache.get(cacheKey);

    if (cached) {
        return NextResponse.json({ data: JSON.parse(cached), fromCache: true, success: true }, { status: 200 });
    }

    try {
        // Connect to MongoDB
        await ConnectDB();

        // Create regex for query with tokenized search
        const regex = createSearchRegex(query);

        // Fetch users & slots matching the query
        const usersRaw = await UserModel.find({
            $or: [
                { username: regex },
                { email: regex },
                { profession: regex },
                { title: regex },
            ],
        }, 'username email profession title _id trendScore searchScore createdAt').lean<RawUser[]>();

        const slotsRaw: RawSlot[] = await SlotModel.aggregate([
            { $addFields: { bookedCount: { $size: "$bookedUsers" } } },
            { $match: { $and: [
                { $or: [
                    { title: regex },
                    { category: regex },
                    { description: regex },
                    { tags: regex }
                ]},
                { $expr: { $lt: ["$bookedCount", "$guestSize"] } }
            ]}},
            { $project: {
                _id: 1, title: 1, category: 1, description: 1, tags: 1,
                ownerId: 1, bookedUsers: 1, guestSize: 1, trendScore: 1, engagementRate: 1, createdAt: 1
            }}
        ]) as RawSlot[];

        // Fuse.js fuzzy searchers for advanced matching
        const userFuse = new Fuse(usersRaw, {
            keys: ['username', 'email', 'profession', 'title'],
            threshold: 0.3,
            distance: 50,
            ignoreLocation: true,
            minMatchCharLength: 2,
            includeScore: true,
            shouldSort: true,
        });

        const slotFuse = new Fuse(slotsRaw, {
            keys: ['title', 'category', 'description', 'tags'],
            threshold: 0.3,
            distance: 50,
            ignoreLocation: true,
            minMatchCharLength: 2,
            includeScore: true,
            shouldSort: true,
        });

        let userResults: SearchResult[] = [];
        let slotResults: SearchResult[] = [];

        const users = userFuse.search(query);
        const slots = slotFuse.search(query);

        userResults = await Promise.all(users.map(async result => {
            const user = result.item;
            return {
                _id: (user._id as string).toString(),
                field: 'user',
                name: user.username,
                matchedString: highlightMatch(user, query, ['username', 'email', 'profession', 'title']),
                href: `/searched-profile?user=${(user._id as string).toString()}`,
                relevance: calculateRelevance(result.score ?? 1, user.trendScore, user.searchScore, new Date(user.createdAt)),
            };
        }));

        slotResults = await Promise.all(slots.map(async result => {
            const slot = result.item;
            const isMySlot = slot.ownerId?.toString() === userId;
            const isBooked = slot.bookedUsers?.some((id: string) => id.toString() === userId);

            let href = `/meeting-post-feed?meeting-post=${(slot._id as string).toString()}`;
            if (isMySlot) href = `/my-slots?slot=${(slot._id as string).toString()}`;
            else if (isBooked) href = `/booked-meetings?meeting-slot=${(slot._id as string).toString()}`;

            return {
                _id: (slot._id as string).toString(),
                field: 'slot',
                name: slot.title,
                matchedString: highlightMatch(slot, query, ['title', 'category', 'description', 'tags']),
                href,
                relevance: calculateRelevance(result.score ?? 1, slot.trendScore, slot.engagementRate, new Date(slot.createdAt)),
            };
        }));

        // Merge and sort results by relevance
        const allResults = [...userResults, ...slotResults].sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0));

        // Cache result in Redis
        await redisCache.set(cacheKey, JSON.stringify(allResults), 300); // Cache for 5 minutes

        return NextResponse.json({ success: true, data: allResults }, { status: 200 });

    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
};

// ? Put api to increment users search score by 1 for each search clicked.
export async function PUT(req: NextRequest) {
    try {
        await ConnectDB();

        const { fieldUniqueId, field } = await req.json();

        if (!fieldUniqueId) {
            return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
        }
        if (!field) {
            return NextResponse.json({ success: false, message: 'Field not set properly.' }, { status: 400 });
        }

        let selectedUserId = fieldUniqueId;;

        if (field === 'slot') {
            const slot = await SlotModel.findById(fieldUniqueId).select('ownerId');
            if (!slot) {
                return NextResponse.json({ success: false, message: 'Slot not found' }, { status: 404 });
            }
            selectedUserId = slot.ownerId;
        }

        // Increment the searchScore by 1
        const user = await UserModel.findByIdAndUpdate(
            selectedUserId,
            { $inc: { searchScore: 1 } },
            { new: true } // returns the updated document
        );

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }


        return NextResponse.json({
            success: true,
            message: 'Search score incremented by 1',
            newScore: user.searchScore,
        });
    } catch (error) {
        console.error('Error updating search score:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}