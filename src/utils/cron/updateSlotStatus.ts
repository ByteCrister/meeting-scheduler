import ConnectDB from "@/config/ConnectDB";
import NotificationsModel, { INotificationType } from "@/models/NotificationsModel";
import SlotModel, { IRegisterStatus } from "@/models/SlotModel";
import cron from "node-cron";
import { triggerSocketEvent } from "../socket/triggerSocketEvent";
import { SocketTriggerTypes } from "../constants";
import UserModel from "@/models/UserModel";

// Fix Global type properly
declare global {
    // eslint-disable-next-line no-var
    var slotStatusCronStarted: boolean | undefined;
}

function parseTimeTo24Hour(timeStr: string): { hours: number; minutes: number } {
    try {
        if (!timeStr) throw new Error("Invalid time string");

        let hours = 0, minutes = 0;

        if (timeStr.includes("AM") || timeStr.includes("PM")) {
            const [time, modifier] = timeStr.trim().split(" ");
            // eslint-disable-next-line prefer-const
            let [h, m] = time.split(":").map(Number);

            if (modifier === "PM" && h !== 12) h += 12;
            if (modifier === "AM" && h === 12) h = 0;

            hours = h;
            minutes = m;
        } else {
            [hours, minutes] = timeStr.split(":").map(Number);
        }

        if (isNaN(hours) || isNaN(minutes)) throw new Error("Invalid time format");

        return { hours, minutes };
    } catch (error) {
        console.error("[parseTimeTo24Hour Error]:", (error as Error).message);
        return { hours: 0, minutes: 0 };
    }
}

function parseUTCOffset(timeZone: string): number {
    // Example input: "UTC+6", "UTC+06:30", "UTC-4", "UTC+0"
    const match = timeZone.match(/UTC([+-])(\d{1,2})(?::(\d{2}))?/);
    if (!match) return 0;

    const sign = match[1] === "+" ? 1 : -1;
    const hours = parseInt(match[2], 10);
    const minutes = match[3] ? parseInt(match[3], 10) : 0;

    return sign * (hours * 60 + minutes); // in minutes
}

export async function updateSlotStatuses() {
    try {
        await ConnectDB();

        const nowUTC = new Date();

        const slots = await SlotModel.find({
            status: { $in: [IRegisterStatus.Upcoming, IRegisterStatus.Ongoing] },
        });

        for (const slot of slots) {
            if (!slot?.meetingDate || !slot?.durationFrom || !slot?.durationTo) {
                console.warn(`Slot ID ${slot._id} has incomplete timing info.`);
                continue;
            }

            const user = await UserModel.findById(slot.ownerId).select("timeZone image");
            const timeZone = user?.timeZone || "UTC+0";
            const offsetMinutes = parseUTCOffset(timeZone); // convert timeZone string to offset in minutes

            const { hours: fromHours, minutes: fromMinutes } = parseTimeTo24Hour(slot.durationFrom);
            const { hours: toHours, minutes: toMinutes } = parseTimeTo24Hour(slot.durationTo);

            // Create the base date string (YYYY-MM-DD) from meetingDate
            const dateStr = new Date(slot.meetingDate).toISOString().split("T")[0]; // e.g. "2025-05-01"

            // Construct local time as ISO-like string
            const localStartStr = `${dateStr}T${String(fromHours).padStart(2, '0')}:${String(fromMinutes).padStart(2, '0')}:00`;
            const localEndStr = `${dateStr}T${String(toHours).padStart(2, '0')}:${String(toMinutes).padStart(2, '0')}:00`;

            // Parse as local time, then adjust to UTC
            const offsetMs = offsetMinutes * 60 * 1000;
            const meetingStartUTC = new Date(new Date(localStartStr).getTime() - offsetMs);
            const meetingEndUTC = new Date(new Date(localEndStr).getTime() - offsetMs);


            let newStatus = slot.status;

            if (nowUTC < meetingStartUTC) {
                newStatus = IRegisterStatus.Upcoming;
            } else if (nowUTC >= meetingStartUTC && nowUTC <= meetingEndUTC) {
                newStatus = IRegisterStatus.Ongoing;
            } else if (nowUTC > meetingEndUTC) {
                newStatus = slot.engagementRate === 0 ? IRegisterStatus.Expired : IRegisterStatus.Completed;
            }

            if (slot.status !== newStatus) {
                slot.status = newStatus;
                await slot.save();
                console.log(`Slot ID ${slot._id} updated to ${newStatus}`);

                // Notify the meeting host to create a video call
                if (newStatus === IRegisterStatus.Ongoing) {
                    const baseNotification = {
                        type: INotificationType.MEETING_TIME_STARTED,
                        sender: slot.ownerId,
                        receiver: slot.ownerId,
                        slot: slot._id,
                        message: `*** It's time to Start your Meeting ***`,
                        isRead: false,
                        isClicked: false,
                        createdAt: new Date(),
                        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    };

                    const notificationDoc = new NotificationsModel(baseNotification);
                    const saved = await notificationDoc.save();

                    triggerSocketEvent({
                        userId: slot.ownerId.toString(),
                        type: SocketTriggerTypes.MEETING_TIME_STARTED,
                        notificationData: {
                            ...baseNotification,
                            _id: saved._id,
                            image: user?.image,
                        },
                    });
                }
            }
        }
    } catch (error) {
        console.error("[updateSlotStatuses Error]:", (error as Error).message);
    }
}

// Run cron every minute in UTC+6
if (process.env.NODE_ENV === "production" || !global.slotStatusCronStarted) {
    cron.schedule("* * * * *", updateSlotStatuses, {
        timezone: "Asia/Dhaka",
    });
    global.slotStatusCronStarted = true;
    console.log("Slot status cron job started (UTC+6).");
}
