import { ApiSPType } from "@/utils/constants";
import { NextRequest, NextResponse } from "next/server";
import ConnectDB from "@/config/ConnectDB";
import UserModel from "@/models/UserModel";
import { getUserIdFromRequest } from "@/utils/server/getUserFromToken";
import { Types } from "mongoose";


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

interface PopulatedSlot {
    _id: Types.ObjectId;
    title: string;
    description?: string;
    meetingDate: Date;
    durationFrom: string;
    durationTo: string;
    bookedUsers: Types.ObjectId[];
    status: "upcoming" | "ongoing" | "completed" | "expired";
    createdAt: Date;
}

interface BookedSlotItem {
    slotId: PopulatedSlot;
}

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const searched_user_id = searchParams.get("searched_user_id");
    const type = searchParams.get("type") as ApiSPType;

    if (!searched_user_id || !type) {
        return NextResponse.json({ success: false, message: "Invalid query parameters" }, { status: 400 });
    }

    try {
        await ConnectDB();

        const currentUserId = await getUserIdFromRequest(req);
        if (!currentUserId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const currentUser = await UserModel.findById(currentUserId).select("followers following");

        const query = UserModel.findById(searched_user_id); // Ensuring query object

        // Populate based on type
        const populateOptions = [];

        if (type === ApiSPType.GET_USER || type === ApiSPType.GET_USER_FOLLOWERS) {
            populateOptions.push({ path: "followers.userId", select: "username image title description" });
        }

        if (type === ApiSPType.GET_USER || type === ApiSPType.GET_USER_FOLLOWINGS) {
            populateOptions.push({ path: "following.userId", select: "username image title description" });
        }

        if (type === ApiSPType.GET_USER_MEETINGS) {
            populateOptions.push({
                path: "registeredSlots",
                model: "slots",
                select: "title description meetingDate durationFrom durationTo bookedUsers status createdAt"
            });
        }

        if (type === ApiSPType.GET_USER) {
            populateOptions.push({ path: "registeredSlots", select: "title" });
        }

        // Has to ensure apply populate before executing the query
        populateOptions.forEach(option => {
            query.populate(option); // Applying populate
        });

        const user = await query.exec(); // Using exec() to actually run the query

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }


        switch (type) {
            case ApiSPType.GET_USER: {
                return NextResponse.json(
                    {
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
                            meetingSlots: user.registeredSlots.length
                        }
                    },
                    { status: 200 }
                );
            }

            case ApiSPType.GET_USER_FOLLOWERS: {
                const followers = (user.followers as FollowerItem[]).map((f) => ({
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

            case ApiSPType.GET_USER_FOLLOWINGS: {
                const following = (user.following as FollowerItem[]).map((f) => ({
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

            case ApiSPType.GET_USER_MEETINGS: {
                const bookedMeetings = (user.bookedSlots as BookedSlotItem[]).map(({ slotId }) => {
                    const dateObj = new Date(slotId.meetingDate);

                    return {
                        _id: slotId._id,
                        title: slotId.title,
                        description: slotId.description,
                        date: dateObj.toISOString().split("T")[0],
                        time: dateObj.toISOString().split("T")[1].slice(0, 5),
                        duration: `${slotId.durationFrom} - ${slotId.durationTo}`,
                        participants: slotId.bookedUsers.length,
                        status: slotId.status,
                        createdAt: slotId.createdAt.toISOString(),
                    };
                });

                return NextResponse.json({ success: true, data: bookedMeetings }, { status: 200 });
            }

            default:
                return NextResponse.json({ success: false, message: "Invalid type value" }, { status: 400 });
        }
    } catch (err) {
        console.error("Search profile error:", err);
        return NextResponse.json({ success: false, message: "Server error." }, { status: 500 });
    }
}
