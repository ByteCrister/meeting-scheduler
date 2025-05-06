import ConnectDB from "@/config/ConnectDB";
import UserModel from "@/models/UserModel";
import { getUserIdFromRequest } from "@/utils/server/getUserFromToken";
import { NextRequest, NextResponse } from "next/server";
import { ApiNotificationTypes } from "@/utils/constants";
import SlotModel, { IRegisterStatus } from "@/models/SlotModel";


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
        const allowedStatuses = [IRegisterStatus.Upcoming, IRegisterStatus.Ongoing, IRegisterStatus.Completed];
        const slots = await SlotModel.find({
            ownerId: user._id,
            status: { $in: allowedStatuses },
        }).sort({ meetingDate: -1 })

        // Format response to match sampleActivities
        const activities = slots.map((slot) => ({
            id: slot._id.toString(),
            title: slot.title,
            time: `${slot.durationFrom} - ${slot.durationTo}`,
            type: slot.status === IRegisterStatus.Completed ?
                'recent' : (slot.status === IRegisterStatus.Ongoing && slot.guestSize !== slot.bookedUsers.length)
                    ? 'available' : slot.status, //? 'upcoming' | 'ongoing' - 'available | 'completed' - 'recent'
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

        const body = await req.json();
        const { field, value } = body;

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

        const previousValue = await UserModel.findById(userId).select(field);
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { [field]: value },
            { new: true }
        ).select(field);


        return NextResponse.json(
            {
                success: true,
                message: `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully.`,
                updated: { [field]: updatedUser?.[field as keyof typeof updatedUser] },
                previous: previousValue[field],
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Status PUT Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
