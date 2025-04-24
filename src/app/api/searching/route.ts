// app/api/searching/route.ts
import { NextRequest, NextResponse } from 'next/server';
import ConnectDB from '@/config/ConnectDB';
import UserModel, { IUsers } from '@/models/UserModel';
import SlotModel, { ISlot } from '@/models/SlotModel';
import { getUserIdFromRequest } from '@/utils/server/getUserFromToken';
import mongoose from 'mongoose';
import Fuse from 'fuse.js';

interface SearchResult {
    _id: string;
    name: string;
    matchedString: string;
    href: string;
    field: 'user' | 'slot';
}

interface IUserLean extends IUsers {
    _id: mongoose.Types.ObjectId;
}

interface ISlotLean extends ISlot {
    _id: mongoose.Types.ObjectId;
}

// Highlight matching content from given fields
function highlightMatch<T>(doc: T, query: string, fields: (keyof T)[]): string {
    const lowered = query.toLowerCase();

    for (const field of fields) {
        const value = doc[field];
        if (typeof value === 'string' && value.toLowerCase().includes(lowered)) {
            return value;
        }

        if (Array.isArray(value)) {
            const found = value.find((v: string) => v.toLowerCase().includes(lowered));
            if (found) return found;
        }
    }

    return '';
}

export const GET = async (req: NextRequest): Promise<NextResponse> => {
    const { searchParams } = req.nextUrl;
    const query = searchParams.get('q')?.trim();
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (!query) {
        return NextResponse.json({ success: false, message: 'Missing query parameter `q`' }, { status: 400 });
    }

    try {
        await ConnectDB();

        const [usersRaw, slotsRaw] = await Promise.all([
            UserModel.find().lean<IUserLean[]>(),
            SlotModel.find().lean<ISlotLean[]>()
        ]);

        // Filter out fully booked slots
        // ? Get only available meetings in search
        const availableSlots = slotsRaw.filter(slot => {
            const booked = slot.bookedUsers?.length || 0;
            const capacity = slot.guestSize || 0;
            return booked < capacity;
        });

        // Fuse config for fuzzy searching users
        const userFuse = new Fuse(usersRaw, {
            keys: ['username', 'email', 'profession', 'title'],
            threshold: 0.3,
            distance: 100,
            ignoreLocation: true,
            minMatchCharLength: 2,
        });

        // Fuse config for fuzzy searching slots
        const slotFuse = new Fuse(availableSlots, {
            keys: ['title', 'category', 'description', 'tags'],
            threshold: 0.3,
            distance: 100,
            ignoreLocation: true,
            minMatchCharLength: 2,
        });

        const users = userFuse.search(query).map(result => result.item);
        const slots = slotFuse.search(query).map(result => result.item);

        const userResults: SearchResult[] = users.map(user => ({
            _id: user._id.toString(),
            field: 'user',
            name: user.username,
            matchedString: highlightMatch(user, query, ['username', 'email', 'profession', 'title']),
            href: `/searched-profile?user=${user._id.toString()}`,
        }));

        const slotResults: SearchResult[] = slots.map(slot => {
            const isMySlot = slot.ownerId?.toString() === userId;
            const isBooked = slot.bookedUsers?.some(id => id.toString() === userId);

            let href = `/meeting-post-feed?meeting-post=${slot._id.toString()}`;
            if (isMySlot) href = `/my-slots?slot=${slot._id.toString()}`;
            else if (isBooked) href = `/booked-meetings?meeting-slot=${slot._id.toString()}`;

            return {
                _id: slot._id.toString(),
                field: 'slot',
                name: slot.title,
                matchedString: highlightMatch(slot, query, ['title', 'category', 'description', 'tags']),
                href,
            };
        });

        const results: SearchResult[] = [...userResults, ...slotResults];

        return NextResponse.json({ data: results, success: true }, { status: 200 });

    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
};

// ? Put api to increment users search score by 1 for each search clicked.
export async function PUT(req: NextRequest) {
    try {
        await ConnectDB();

        const userId = await req.json();

        if (!userId) {
            return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
        }

        // Increment the searchScore by 1
        const user = await UserModel.findByIdAndUpdate(
            userId,
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