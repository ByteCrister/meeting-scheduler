"use client";

import ShadcnToast from "@/components/global-ui/toastify-toaster/ShadcnToast";
import { updateBookedMeetingStatus } from "@/lib/features/booked-meetings/bookedSlice";
import { updateSlotBookedUsers } from "@/lib/features/news-feed/newsFeedSlice";
import { decreaseBookedUsers, increaseBookedUsers, updateSlotStatus } from "@/lib/features/Slots/SlotSlice";
import { addSingleNotification, incrementNotificationCount } from "@/lib/features/users/userSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RegisterSlotStatus } from "@/types/client-types";
import { NotificationType, SocketTriggerTypes } from "@/utils/constants";
import { getSocket, initiateSocket } from "@/utils/socket/initiateSocket";
import { initializeServerSocket } from "@/utils/socket/socketInitialized";
import { useEffect, useRef } from "react";

const useNotificationSocket = () => {
    const { user } = useAppSelector((state) => state.userStore);
    const dispatch = useAppDispatch();
    const socketRef = useRef<ReturnType<typeof initiateSocket> | null>(null);

    useEffect(() => {
        if (!user?._id) return;

        // Ensure socket is initialized only once
        const setupSocket = async () => {
            await initializeServerSocket();

            if (!socketRef.current) {
                socketRef.current = getSocket();
                const socket = socketRef.current;

                socket.on("connect", () => {
                    socket.emit(SocketTriggerTypes.REGISTER_USER, { userId: user._id });
                });

                socket.on(SocketTriggerTypes.RECEIVED_NOTIFICATION, (data) => {
                    const isSenderDisabled = user?.disabledNotificationUsers?.includes(data.notificationData.sender);
                    if (!isSenderDisabled) {
                        dispatch(addSingleNotification(data.notificationData)); // ? Adding new notification
                        dispatch(incrementNotificationCount()); // ? incrementing number of unseen new notifications
                        ShadcnToast('New notification arrived!');
                        console.log("*** Received New Notification ***");
                    }
                });


                socket.on(SocketTriggerTypes.MEETING_STARTED, (data) => {
                    const isSenderDisabled = user?.disabledNotificationUsers?.includes(data.notificationData.sender);
                    const { slot } = data.notificationData;
                    if (!isSenderDisabled) {
                        dispatch(addSingleNotification(data.notificationData)); // ? Adding new notification
                        dispatch(incrementNotificationCount()); // ? incrementing number of unseen new notifications
                        ShadcnToast('New notification arrived!');
                        console.log("*** Received New Notification ***");
                    }
                    dispatch(updateBookedMeetingStatus({ slotId: slot as string, newStatus: RegisterSlotStatus.Ongoing }));
                });

                socket.on(SocketTriggerTypes.USER_SLOT_BOOKED, (data) => {
                    dispatch(updateSlotBookedUsers({
                        userId: data.sender as string,
                        slotId: data.slotId as string,
                        type: NotificationType.SLOT_BOOKED,
                    }));
                });
                socket.on(SocketTriggerTypes.INCREASE_BOOKED_USER, (data) => {
                    dispatch(increaseBookedUsers({
                        sloId: data.notificationData.slotId,
                        newBookedUserId: data.notificationData.newBookedUserId
                    }));
                });



                socket.on(SocketTriggerTypes.DECREASE_BOOKED_USER, (data) => {
                    dispatch(decreaseBookedUsers({
                        sloId: data.notificationData.slotId,
                        bookedUserId: data.notificationData.bookedUserId
                    }));
                });
                socket.on(SocketTriggerTypes.USER_SLOT_UNBOOKED, (data) => {
                    dispatch(updateSlotBookedUsers({
                        userId: data.sender as string,
                        slotId: data.slotId as string,
                        type: NotificationType.SLOT_UNBOOKED,
                    }));
                });

                socket.on(SocketTriggerTypes.MEETING_TIME_STARTED, (data) => {
                    dispatch(addSingleNotification(data.notificationData)); // ? Adding new notification
                    dispatch(incrementNotificationCount()); // ? incrementing number of unseen new notifications
                    ShadcnToast('Please start the meeting.');
                    console.log("*** Start meeting notification ***");

                    dispatch(updateSlotStatus({
                        slotId: data.notificationData.slot as string,
                        newStatus: RegisterSlotStatus.Ongoing // ? Changing meeting's status to ongoing. Now the owner can Make a video meeting call
                    }))

                });


            }
        };

        setupSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                console.log("Socket disconnected");
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?._id,]);

};

export default useNotificationSocket;
