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
        return { hours: 0, minutes: 0 }; // fallback safe values
    }
}

export async function updateSlotStatuses() {
    try {
        await ConnectDB();

        const now = new Date();
        const slots = await SlotModel.find({
            status: { $in: [IRegisterStatus.Upcoming, IRegisterStatus.Ongoing] },
        });

        for (const slot of slots) {
            if (!slot?.meetingDate || !slot?.durationFrom || !slot?.durationTo) {
                console.warn(`Slot ID ${slot._id} has incomplete timing information.`);
                continue;
            }

            const meetingStart = new Date(slot.meetingDate);
            const meetingEnd = new Date(slot.meetingDate);

            const { hours: fromHours, minutes: fromMinutes } = parseTimeTo24Hour(slot.durationFrom);
            const { hours: toHours, minutes: toMinutes } = parseTimeTo24Hour(slot.durationTo);

            meetingStart.setHours(fromHours, fromMinutes, 0, 0);
            meetingEnd.setHours(toHours, toMinutes, 0, 0);

            let newStatus = slot.status;

            if (now < meetingStart) {
                newStatus = IRegisterStatus.Upcoming;
            } else if (now >= meetingStart && now <= meetingEnd) {
                newStatus = IRegisterStatus.Ongoing;
            } else if (now > meetingEnd) {
                newStatus = slot.engagementRate === 0 ? IRegisterStatus.Expired : IRegisterStatus.Completed;
            }

            if (slot.status !== newStatus) {
                slot.status = newStatus;
                await slot.save();
                console.log(`Slot ID ${slot._id} updated to ${newStatus}`);
            }

            if (newStatus === IRegisterStatus.Ongoing) {
                const user = await UserModel.findById(slot.ownerId).select('image');
                const now = new Date();
                const baseNotification = {
                    type: INotificationType.MEETING_TIME_STARTED,
                    sender: slot.ownerId,
                    slot: slot._id,
                    message: `*** It's time to Start your Meeting *** `,
                    isRead: false,
                    isClicked: false,
                    createdAt: now,
                    expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
                };
                const notification = { ...baseNotification, receiver: slot.ownerId };
                const notificationDoc = new NotificationsModel(notification);
                const saved = await notificationDoc.save();
                triggerSocketEvent({
                    userId: slot.ownerId.toString(),
                    type: SocketTriggerTypes.MEETING_TIME_STARTED,
                    notificationData: {
                        ...notification,
                        _id: saved._id,
                        image: user?.image,
                    },
                });
            }
        }

    } catch (error) {
        console.error("[updateSlotStatuses Error]:", (error as Error).message);
    }
}

// Schedule cron safely
if (process.env.NODE_ENV === "production" || !global.slotStatusCronStarted) {
    cron.schedule("* * * * *", updateSlotStatuses, {
        timezone: "Asia/Kolkata", // or your preferred timezone
    });
    global.slotStatusCronStarted = true;
    console.log("Slot status cron job started.");
}