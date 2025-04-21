"use client";

import { updateSlotBookedUsers } from "@/lib/features/news-feed/newsFeedSlice";
import { addSingleNotification } from "@/lib/features/users/userSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { NotificationType, SocketTriggerTypes } from "@/utils/constants";
import { initiateSocket } from "@/utils/socket/initiateSocket";
import { initializeServerSocket } from "@/utils/socket/socketInitialized";
import { useEffect } from "react";

const useNotificationSocket = () => {
    const { user, notifications } = useAppSelector((state) => state.userStore);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!user?._id) return;

        let socket: ReturnType<typeof initiateSocket>;

        const setupSocket = async () => {
            await initializeServerSocket();

            socket = initiateSocket();

            socket.on("connect", () => {
                socket.emit(SocketTriggerTypes.REGISTER_USER, { userId: user._id });
            });

            socket.on(SocketTriggerTypes.RECEIVED_NOTIFICATION, (data) => {
                const isSenderDisabled = user?.disabledNotificationUsers?.includes(data.notificationData.sender);
                if (!isSenderDisabled) {
                    dispatch(addSingleNotification(data.notificationData));
                    console.log("***New Notification Received***");
                }
            });

            socket.on(SocketTriggerTypes.USER_SLOT_BOOKED, (data) => {
                dispatch(updateSlotBookedUsers({
                    userId: data.sender as string,
                    slotId: data.slotId as string,
                    type: NotificationType.SLOT_BOOKED,
                }));
            });

            socket.on(SocketTriggerTypes.USER_SLOT_UNBOOKED, (data) => {
                dispatch(updateSlotBookedUsers({
                    userId: data.sender as string,
                    slotId: data.slotId as string,
                    type: NotificationType.SLOT_UNBOOKED,
                }));
            });
        };

        setupSocket();

        return () => {
            if (socket) {
                socket.disconnect();
                console.log("🛑 Socket disconnected");
            }
        };
    }, [dispatch, notifications, user?._id, user?.disabledNotificationUsers]);

};

export default useNotificationSocket;