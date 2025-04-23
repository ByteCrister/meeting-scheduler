import { ApiSPType } from "@/utils/constants";
import { NextRequest, NextResponse } from "next/server";
import ConnectDB from "@/config/ConnectDB";
import UserModel from "@/models/UserModel";
import { getUserIdFromRequest } from "@/utils/server/getUserFromToken";
import { Types } from "mongoose";
import { formatUTCDateToOffset } from "@/utils/client/date-convertions/formatUTCDateToOffset";
import { getConvertedTime } from "@/utils/client/date-convertions/convertDateTime";

export const IGetDuration = (startTime: string, endTime: string): string => {
    type Time = { hours: number; minutes: number };

    const parseTime = (timeStr: string): Time => {
        const [time, meridian] = timeStr.split(" ");
        // eslint-disable-next-line prefer-const
        let [hours, minutes] = time.split(":").map(Number);

        if (meridian === "PM" && hours !== 12) hours += 12;
        if (meridian === "AM" && hours === 12) hours = 0;

        return { hours, minutes };
    };

    const start = parseTime(startTime);
    const end = parseTime(endTime);

    const startDate = new Date(0, 0, 0, start.hours, start.minutes);
    const endDate = new Date(0, 0, 0, end.hours, end.minutes);

    let diffMs = endDate.getTime() - startDate.getTime();

    if (diffMs < 0) {
        // If end time is before start time, assume it's the next day
        diffMs += 24 * 60 * 60 * 1000;
    }

    const diffMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (hours > 0 && minutes > 0) {
        return `${hours} hr ${minutes} min`;
    } else if (hours > 0) {
        return `${hours} hr`;
    } else {
        return `${minutes} min`;
    }
}

// ? Converting time durations into my time zone
export const convertTimeByTimeZone = (targetTimeZone: string, toConvertTimeZone: string, time: string, date: string) => {
    return targetTimeZone !== toConvertTimeZone ? getConvertedTime(date, time, toConvertTimeZone) : time;
};


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
    meetingDate: string;
    durationFrom: string;
    durationTo: string;
    bookedUsers: Types.ObjectId[];
    status: "upcoming" | "ongoing" | "completed" | "expired";
    createdAt: Date;
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

        const currentUser = await UserModel.findById(currentUserId).select("followers following timeZone");

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
                const registeredMeetingSlots = (user.registeredSlots as PopulatedSlot[]).map((slot) => {
                    const ConvertedTimeZoneUTCDate = user.timeZone !== currentUser.timeZone
                        ? formatUTCDateToOffset(slot.meetingDate, currentUser.timeZone)
                        : slot.meetingDate;

                    const convertedDurationFrom = convertTimeByTimeZone(user.timeZone, currentUser.timeZone, slot.durationFrom, slot.meetingDate);
                    const convertedDurationTo = convertTimeByTimeZone(user.timeZone, currentUser.timeZone, slot.durationTo, slot.meetingDate);

                    return {
                        _id: slot._id,
                        title: slot.title,
                        description: slot.description,
                        meetingDate: ConvertedTimeZoneUTCDate,
                        durationFrom: convertedDurationFrom,
                        duration: IGetDuration(convertedDurationFrom, convertedDurationTo),
                        participants: slot.bookedUsers.length,
                        status: slot.status,
                        createdAt: slot.createdAt,
                        isBooked: slot.bookedUsers.some((uId) => uId.toString() === currentUserId),
                    };
                });

                return NextResponse.json({ success: true, data: registeredMeetingSlots }, { status: 200 });
            }

            default:
                return NextResponse.json({ success: false, message: "Invalid type value" }, { status: 400 });
        }
    } catch (err) {
        console.error("Search profile error:", err);
        return NextResponse.json({ success: false, message: "Server error." }, { status: 500 });
    }
}
