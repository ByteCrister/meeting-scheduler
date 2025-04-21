import ConnectDB from "@/config/ConnectDB";
import UserModel from "@/models/UserModel";
import { getUserIdFromRequest } from "@/utils/server/getUserFromToken";
import { NextRequest, NextResponse } from "next/server";
import { ApiNotificationTypes } from "@/utils/constants";
import SlotModel from "@/models/SlotModel";
// import { getConvertedTime } from "@/utils/client/date-convertions/convertDateTime";


export async function GET(req: NextRequest) {

    try {
        await ConnectDB();

        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await UserModel.findById(userId).select("-password"); // Exclude password

        if (!user) {
            return new Response(JSON.stringify({ success: false, message: "User not found" }), { status: 404 });
        }

        // Only fetch slots with specific statuses
        const allowedStatuses = ['upcoming', 'ongoing', 'completed'];
        const slots = await SlotModel.find({
            ownerId: user._id,
            status: { $in: allowedStatuses },
        })
            .sort({ meetingDate: -1 })
            .lean();

            // Format response to match sampleActivities
            const activities = slots.map((slot) => ({
            id: slot._id,
            title: slot.title,
            time: user.timeZone,
            // time: getConvertedTime(slot.meetingDate, slot.durationFrom, user.timeZone),
            type: slot.status === 'completed' ? 'recent' : (slot.status === 'ongoing' && slot.guestSize !== slot.bookedUsers.length) ? 'available' : slot.status, //? 'upcoming' | 'ongoing' - 'available | 'completed' - 'recent'
        }));

        return NextResponse.json({ user: user, activities: activities, success: true }, { status: 200 });
    } catch (error) {
        console.log("JWT Verification Error:", error);
        return new Response(JSON.stringify({ message: "Invalid token" }), { status: 401 });
    }
}

// ? api-status-update :: Notification.tsx, , , , 
export async function POST(req: NextRequest) {
    try {
        await ConnectDB();

        const type = req.nextUrl.searchParams.get("type");

        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        if (type === ApiNotificationTypes.REFRESH_NOTIFICATION) {
            await UserModel.findByIdAndUpdate(userId, { countOfNotifications: 0 }, { new: true });

        } else if (type === ApiNotificationTypes.ADD_NEW_NOTIFICATION) {
            await UserModel.findByIdAndUpdate(userId, { $inc: { countOfNotifications: 1 } }, { new: true });

        }

        return NextResponse.json({ success: true, message: 'status updated successfully.' }, { status: 201 });

    } catch (error) {
        console.log("Status Update Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// ? PUT api from ProfileComponent.tsx
export async function PUT(req: NextRequest) {
    try {
        await ConnectDB();

        const searchParams = req.nextUrl.searchParams;
        const field = searchParams.get('field');
        const value = searchParams.get('value');

        if (!field || !value) {
            return NextResponse.json({ message: 'Missing query parameters' }, { status: 400 });
        }

        const allowedFields = ['username', 'title', 'image', 'profession', 'timeZone'];

        if (!allowedFields.includes(field)) {
            return NextResponse.json({ message: 'Field update not allowed' }, { status: 400 });
        }

        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { [field]: value },
            { new: true }
        ).select(field);

        if (!updatedUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(
            { success: true, updated: { [field]: updatedUser[field as keyof typeof updatedUser] } },
            { status: 200 }
        );
    } catch (error) {
        console.log('Status PUT Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}