import { ApiSPType } from "@/utils/constants";
import { NextRequest, NextResponse } from "next/server";
import ConnectDB from "@/config/ConnectDB";
import UserModel from "@/models/UserModel";
import SlotModel from "@/models/SlotModel";
import { getUserIdFromRequest } from "@/utils/server/getUserFromToken";
import { Types } from "mongoose";
import { registerSlot } from "@/types/client-types";

interface PopulatedUser {
    _id: Types.ObjectId;
    username: string;
    image: string;
    title: string;
    description: string,
}

interface FollowerItem {
    userId: PopulatedUser;
}

interface CurrentUserType {
    followers: { userId: Types.ObjectId }[];
    following: { userId: Types.ObjectId }[];
}


export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const searched_user_id = searchParams.get("searched_user_id");
    const type = searchParams.get("type") as ApiSPType;
    const filterType = searchParams.get("filterType") || "all";

    if (!searched_user_id || !type) {
        return NextResponse.json({ success: false, message: "Invalid query parameters" }, { status: 400 });
    }

    try {
        await ConnectDB();
        const currentUserId = await getUserIdFromRequest(req);
        if (!currentUserId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const currentUser = await UserModel.findById(currentUserId).select("followers following timeZone");

        const query = UserModel.findById(searched_user_id);

        if (type === ApiSPType.GET_USER_MEETINGS) {
            query.populate({
                path: "registeredSlots",
                model: "slots",
                select: "title description meetingDate durationFrom durationTo bookedUsers status createdAt category owner"
            });
        }

        const user = await query.exec();
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        if (type === ApiSPType.GET_USER_MEETINGS) {
            let slots = (user.registeredSlots || []) as registerSlot[];

            if (filterType === "bookedByMe") {
                // Get meetings that current user has booked
                slots = slots.filter(slot => slot.bookedUsers.map(id => id.toString()).includes(currentUserId));
            }

            if (filterType === "bookedMine") {
                // Get meetings where searched user booked my slots
                const mySlots = await SlotModel.find({ owner: currentUserId });
                const mySlotIds = mySlots.map(s => s._id.toString());
                slots = slots.filter(slot => mySlotIds.includes(slot._id.toString()));
            }

            const responseData = slots.map(slot => ({
                _id: slot._id,
                title: slot.title,
                description: slot.description,
                meetingDate: slot.meetingDate,
                durationFrom: slot.durationFrom,
                durationTo: slot.durationTo,
                participants: slot.bookedUsers.length,
                status: slot.status,
                createdAt: slot.createdAt,
                isBooked: slot.bookedUsers.includes(currentUserId),
                category: slot.category,
            }));

            // Extract unique categories if requested
            const uniqueCategories = Array.from(new Set(slots.map(slot => slot.category))).filter(Boolean);

            return NextResponse.json({
                success: true,
                data: responseData,
                uniqueCategories,
            }, { status: 200 });
        }

        // Keep existing user/followers/followings handlers
        if (type === ApiSPType.GET_USER) {
            return NextResponse.json({
                success: true,
                data: {
                    _id: user._id,
                    username: user.username,
                    title: user.title,
                    profession: user.profession,
                    timezone: user.timeZone,
                    image: user.image,
                    followers: user.followers.length,
                    following: user.following.length,
                    meetingSlots: user.registeredSlots.length,
                    isFollowing: user.followers.some((u: { userId: { _id: string } }) => u.userId._id.toString() === currentUserId)
                }
            }, { status: 200 });
        }

        if (type === ApiSPType.GET_USER_FOLLOWERS) {
            const followers = (user.followers as FollowerItem[] || []).map((f) => ({
                _id: f.userId._id,
                username: f.userId.username,
                image: f.userId.image,
                title: f.userId.title,
                description: f.userId.description,
                isFollower: (currentUser as CurrentUserType).followers.some((u) => u.userId.equals(f.userId._id)),
                isFollowing: (currentUser as CurrentUserType).following.some((u) => u.userId.equals(f.userId._id))
            }));
            return NextResponse.json({ success: true, data: followers }, { status: 200 });
        }

        if (type === ApiSPType.GET_USER_FOLLOWINGS) {
            const following = (user.following as FollowerItem[] || []).map((f) => ({
                _id: f.userId._id,
                username: f.userId.username,
                image: f.userId.image,
                title: f.userId.title,
                description: f.userId.description,
                isFollower: (currentUser as CurrentUserType).followers.some((u) => u.userId.equals(f.userId._id)),
                isFollowing: (currentUser as CurrentUserType).following.some((u) => u.userId.equals(f.userId._id))
            }));
            return NextResponse.json({ success: true, data: following }, { status: 200 });
        }

        return NextResponse.json({ success: false, message: "Invalid type value" }, { status: 400 });
    } catch (err) {
        console.error("Search profile error:", err);
        return NextResponse.json({ success: false, message: "Server error." }, { status: 500 });
    }
}
