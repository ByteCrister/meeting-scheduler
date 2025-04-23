// app/api/searching/route.ts
import { NextRequest, NextResponse } from 'next/server';
import ConnectDB from '@/config/ConnectDB';
import UserModel, { IUsers } from '@/models/UserModel';
import SlotModel, { ISlot } from '@/models/SlotModel';
import mongoose from 'mongoose';
import { getUserIdFromRequest } from '@/utils/server/getUserFromToken';


interface SearchResult {
    _id: string;
    name: string;
    matchedString: string;
    href: string;
}

export const GET = async (req: NextRequest): Promise<NextResponse> => {
    const { searchParams } = req.nextUrl;
    const query = searchParams.get('q');
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!query) {
        return NextResponse.json({ message: 'Missing query parameter `q`' }, { status: 400 });
    }

    try {
        await ConnectDB();
        const regex = new RegExp(query, 'i');

        const [users, slots] = await Promise.all([
            UserModel.find({
                $or: [
                    { username: regex },
                    { email: regex },
                    { profession: regex },
                    { title: regex }
                ]
            }).lean<(IUsers & { _id: mongoose.Types.ObjectId })[]>(),

            SlotModel.find({
                $or: [
                    { title: regex },
                    { category: regex },
                    { description: regex },
                    { tags: { $in: [regex] } }
                ]
            }).lean<(ISlot & { _id: mongoose.Types.ObjectId })[]>()
        ]);

        const userResults: SearchResult[] = users.map(user => {
            const matchedField = ['username', 'email', 'profession', 'title'].find(field =>
                (user[field as keyof IUsers] as string)?.match(regex)
            );

            return {
                _id: user._id.toString(),
                name: user.username,
                matchedString: matchedField ? (user[matchedField as keyof IUsers] as string) : '',
                href: `/searched-profile?user=${user._id.toString()}`
            };
        });

        const slotResults: SearchResult[] = slots.map(slot => {
            const matchedField =
                ['title', 'category', 'description'].find(field =>
                    (slot[field as keyof ISlot] as string)?.match(regex)
                ) || (slot.tags?.find(tag => tag.match(regex)) && 'tags');

            const isBooked = userId ? slot.bookedUsers?.some(id => id.toString() === userId) : false;

            return {
                _id: slot._id.toString(),
                name: slot.title,
                matchedString:
                    matchedField === 'tags'
                        ? (slot.tags.find(tag => tag.match(regex)) ?? '')
                        : (matchedField ? (slot[matchedField as keyof ISlot] as string) : ''),
                href: isBooked
                    ? `/booked-meetings?meeting-slot=${slot._id.toString()}`
                    : `/meeting-post-feed?post=${slot._id.toString()}`
            };
        });

        const results: SearchResult[] = [...userResults, ...slotResults];

        return NextResponse.json({ data: results, success: true });

    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
};