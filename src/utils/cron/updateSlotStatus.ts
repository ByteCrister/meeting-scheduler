import ConnectDB from "@/config/ConnectDB";
import NotificationsModel, { INotificationType } from "@/models/NotificationsModel";
import SlotModel, { IRegisterStatus } from "@/models/SlotModel";
import cron from "node-cron";
import { triggerSocketEvent } from "../socket/triggerSocketEvent";
import { SocketTriggerTypes } from "../constants";
import UserModel from "@/models/UserModel";
import { emailAuthentication } from "@/config/NodeEmailer";
import { DateTime } from "luxon"; // Make sure to install this package

declare global {
    // eslint-disable-next-line no-var
    var slotStatusCronStarted: boolean | undefined;
}

function parseTimeTo24Hour(timeStr: string): { hours: number; minutes: number } | null {
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
        return null;
    }
}

function parseUTCOffset(timeZone: string): number {
    const match = timeZone.match(/UTC([+-])(\d{1,2})(?::(\d{2}))?/);
    if (!match) return 0;

    const sign = match[1] === "+" ? 1 : -1;
    const hours = parseInt(match[2], 10);
    const minutes = match[3] ? parseInt(match[3], 10) : 0;

    return sign * (hours * 60 + minutes);
}


export async function updateSlotStatuses() {
    try {
        await ConnectDB();

        const nowUTC = DateTime.utc();
        const slots = await SlotModel.find({
            status: { $in: [IRegisterStatus.Upcoming, IRegisterStatus.Ongoing] },
        });

        for (const slot of slots) {
            if (!slot?.meetingDate || !slot?.durationFrom || !slot?.durationTo) {
                console.warn(`Slot ID ${slot._id} has incomplete timing info.`);
                continue;
            }

            const user = await UserModel.findById(slot.ownerId).select("timeZone image email username");
            const timeZone = user?.timeZone || "UTC+0";
            const offsetMinutes = parseUTCOffset(timeZone);

            const fromTime = parseTimeTo24Hour(slot.durationFrom);
            const toTime = parseTimeTo24Hour(slot.durationTo);

            if (!fromTime || !toTime) {
                console.warn(`Skipping slot ${slot._id} due to time parse failure.`);
                continue;
            }

            const dateStr = DateTime.fromJSDate(new Date(slot.meetingDate)).toISODate();

            const start = DateTime.fromISO(`${dateStr}T${String(fromTime.hours).padStart(2, '0')}:${String(fromTime.minutes).padStart(2, '0')}:00`, { zone: "UTC" })
                .minus({ minutes: offsetMinutes });
            const end = DateTime.fromISO(`${dateStr}T${String(toTime.hours).padStart(2, '0')}:${String(toTime.minutes).padStart(2, '0')}:00`, { zone: "UTC" })
                .minus({ minutes: offsetMinutes });

            const timeDiffMinutes = Math.floor(start.diff(nowUTC, "minutes").minutes);
            const timeDiffHours = Math.floor(timeDiffMinutes / 60);
            const timeDiffDays = Math.floor(timeDiffHours / 24);

            if (slot.status === IRegisterStatus.Upcoming && timeDiffDays <= 1) {
                if (
                    (timeDiffDays === 1 && timeDiffHours % 24 === 0 && timeDiffMinutes % 60 === 0) ||
                    (timeDiffDays === 0 && timeDiffHours === 3 && timeDiffMinutes % 60 === 0) ||
                    (timeDiffDays === 0 && timeDiffHours === 0 && timeDiffMinutes === 5)
                ) {
                    // Check if reminder already sent within last 60 seconds
                    const nowLuxon = DateTime.utc();
                    const lastSent = slot.lastReminderSentAt ? DateTime.fromISO(slot.lastReminderSentAt.toISOString()) : null;

                    const lastSentDiff = lastSent ? nowLuxon.diff(lastSent, "seconds").seconds : Infinity;

                    if (lastSentDiff > 60) {
                        const subject = `Reminder: Your meeting "${slot.title}" is coming up!`;
                        const html = `
            <p>Hi ${user?.username || 'there'},</p>
            <p>This is a reminder that your meeting "<strong>${slot.title}</strong>" is scheduled at <strong>${slot.durationFrom}</strong> on <strong>${dateStr}</strong>.</p>
            <p>Thank you!</p>
        `;
                        if (user?.email) {
                            await emailAuthentication(user.email, subject, html);
                            slot.lastReminderSentAt = new Date();
                            await slot.save();
                            console.log(`Reminder email sent to ${user.email} for slot ID ${slot._id}`);
                        }
                    } else {
                        console.log(`Reminder already sent recently for slot ID ${slot._id}`);
                    }
                }

            }

            let newStatus = slot.status;

            if (nowUTC < start) {
                newStatus = IRegisterStatus.Upcoming;
            } else if (nowUTC >= start && nowUTC <= end) {
                newStatus = IRegisterStatus.Ongoing;
            } else if (nowUTC > end) {
                newStatus = slot.engagementRate === 0 ? IRegisterStatus.Expired : IRegisterStatus.Completed;
            }

            if (slot.status !== newStatus) {
                slot.status = newStatus;
                await slot.save();
                console.log(`Slot ID ${slot._id} updated to ${newStatus}`);

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
            } else {
                await slot.save();
            }
        }
    } catch (error) {
        console.error("[updateSlotStatuses Error]:", (error as Error).message);
    }
}

if (process.env.NODE_ENV === "production" || !global.slotStatusCronStarted) {
    cron.schedule("* * * * *", updateSlotStatuses, {
        timezone: "Asia/Dhaka",
    });
    global.slotStatusCronStarted = true;
    console.log("Slot status cron job started (UTC+6). [Using Luxon for TZ]");
}
