import ConnectDB from "@/config/ConnectDB";
import { emailAuthentication } from "@/config/NodeEmailer";
import NotificationsModel, { INotificationType } from "@/models/NotificationsModel";
import SlotModel, { IRegisterStatus } from "@/models/SlotModel";
import UserModel from "@/models/UserModel";
import { convertDateTimeBetweenTimeZones } from "@/utils/client/date-formatting/convertDateTimeBetweenTimeZones";
import { convertTimeBetweenTimeZones } from "@/utils/client/date-formatting/convertTimeBetweenTimeZones";
import { ApiSendEmailType, SocketTriggerTypes } from "@/utils/constants";
import { getUserIdFromRequest } from "@/utils/server/getUserFromToken";
import { triggerSocketEvent } from "@/utils/socket/triggerSocketEvent";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await ConnectDB();

        const body = await req.json();
        const { type, value } = body;
        const { updatedValue, previousValue } = value;

        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        if (type === ApiSendEmailType.UPDATE_TIME_ZONE) {
            // Fetch all the user's slots
            const userSlots = await SlotModel.find({
                ownerId: userId,
                meetingDate: { $gte: new Date() },
                status: IRegisterStatus.Upcoming
            });


            // Loop through all user slots and update their times based on the new time zone
            for (const slot of userSlots) {

                // Update meetingDate, durationFrom, and durationTo
                const updatedMeetingDate = convertDateTimeBetweenTimeZones(previousValue, updatedValue, slot.meetingDate.toISOString(), slot.durationFrom);
                const updatedDurationFrom = convertTimeBetweenTimeZones(previousValue, updatedValue, slot.meetingDate.toISOString(), slot.durationFrom);
                const updatedDurationTo = convertTimeBetweenTimeZones(previousValue, updatedValue, slot.meetingDate.toISOString(), slot.durationTo);

                // Save the updated times back to the slot
                await SlotModel.findByIdAndUpdate(
                    slot._id,
                    {
                        meetingDate: updatedMeetingDate,
                        durationFrom: updatedDurationFrom,
                        durationTo: updatedDurationTo,
                    },
                    { new: true }
                );

                const baseNotification = {
                    type: INotificationType.SLOT_UPDATED,
                    sender: userId,
                    message: `Meeting slot "${slot?.title}" was updated.`,
                    isRead: false,
                    isClicked: false,
                    createdAt: new Date(),
                    expiresAt: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
                };

                for (const bookedUserId of slot.bookedUsers) {
                    const user = await UserModel.findById(bookedUserId).select('email image');
                    if (!user) continue;

                    if (user?.email) {
                        await emailAuthentication(user.email, '***Updated Meeting Schedule***', HTMLUpdatedTimeZone(slot.tile, updatedMeetingDate, updatedDurationFrom, updatedDurationTo));
                    }
                    const notification = { ...baseNotification, receiver: bookedUserId };
                    const saved = await NotificationsModel.create(notification);
                    // ! Emit a notification to the booked user of new meeting date and time duration  
                    triggerSocketEvent({
                        userId: bookedUserId.toString(),
                        type: SocketTriggerTypes.RECEIVED_NOTIFICATION,
                        notificationData: {
                            ...notification,
                            _id: saved._id,
                            slot: slot._id,
                            image: user?.image,
                        },
                    });
                }
            }
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.log('error : ' + error);
        return NextResponse.json({ error: "Failed to send email: " }, { status: 500 });
    }
};



// ? HTML code for sending email of update date adn time
const HTMLUpdatedTimeZone = (title: string, updatedMeetingDate: string, updatedDurationFrom: string, updatedDurationTo: string) => {
    return `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <h2 style="color: #4CAF50;">📅 MeetingSync – Schedule Update</h2>
      <p>Hello,</p>
      <p>The schedule for the meeting titled <strong>"${title}"</strong> has been updated by the host.</p>
      <p><strong>New Schedule:</strong></p>
      <ul>
        <li><strong>Date:</strong> ${new Date(updatedMeetingDate).toLocaleDateString()}</li>
        <li><strong>Start Time:</strong> ${updatedDurationFrom}</li>
        <li><strong>End Time:</strong> ${updatedDurationTo}</li>
      </ul>
      <p>Please make sure to update your calendar accordingly.</p>
      <p>Thank you,<br><strong>MeetingSync Team</strong></p>
    </div>
  `;
};