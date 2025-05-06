import { NextRequest, NextResponse } from "next/server";
import SlotModel from "@/models/SlotModel";
import { IRegisterStatus } from "@/models/SlotModel";
import { Types } from "mongoose";
import ConnectDB from "@/config/ConnectDB";
import { getUserIdFromRequest } from "@/utils/server/getUserFromToken";

export async function GET(req: NextRequest) {
    try {
        await ConnectDB();

        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
        }

        // Fetch slots owned by this user
        const slots = await SlotModel.find({
            ownerId: userId,
            status: { $in: [IRegisterStatus.Upcoming, IRegisterStatus.Ongoing, IRegisterStatus.Completed] },
        })
            .sort({ trendScore: -1, engagementRate: -1 })
            .lean();

        const formattedData = slots.map((slot) => ({
            _id: (slot._id as Types.ObjectId).toString(),
            title: slot.title,
            meetingDate: slot.meetingDate,
            guestSize: slot.guestSize,
            totalParticipants: slot.bookedUsers.length,
            engagementRate: slot.engagementRate,
            category: slot.category,
            status: slot.status,
            description: slot.description,
            tags: slot.tags,
            durationFrom: slot.durationFrom,
            durationTo: slot.durationTo,
        }));

        // Extract unique categories
        const uniqueCategories = Array.from(new Set(formattedData.map(slot => slot.category)));

        return NextResponse.json({ success: true, data: formattedData, categories: uniqueCategories }, { status: 200 });
    } catch (error) {
        console.error("Popular API Error:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}
