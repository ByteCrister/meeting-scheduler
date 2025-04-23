'use client';

import { Notification } from "@/types/client-types";
import { MoreVertical } from "lucide-react";
import getNotificationTime from "@/utils/client/getNotificationTime";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { NotificationType } from "@/utils/constants";
import { toggleNotifyChangeDialog } from "@/lib/features/component-state/componentSlice";
import { useAppDispatch } from "@/lib/hooks";
import { updateNotification } from "@/lib/features/users/userSlice";
import { APIupdateNotificationField } from "@/utils/client/api/api-notifications";

const NotificationCard = ({ notification }: { notification: Notification }) => {
    const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
    const dispatch = useAppDispatch();
    const router = useRouter();


    const toggleMenu = (id: string) => {
        setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleRouting = async (notificationId: string, slot_id: string) => {
        const type = notification.type;
        const RoutingPath = (type === NotificationType.FOLLOW || type === NotificationType.SLOT_BOOKED)
            ? `/searched-profile?user=${notification.sender}`
            : type === NotificationType.SLOT_CREATED
                ? `/meeting-post-feed?post=${slot_id}`
                : NotificationType.SLOT_UPDATED
                    ? `/booked-meetings?meeting-slot=${notification._id}`
                    : type === NotificationType.SLOT_DELETED
                        ? `/searched-profile?user=${notification.sender}` : '';
        router.push(RoutingPath);

        const resIsClicked = await APIupdateNotificationField('isClicked', true, notificationId);
        const resIsRead = await APIupdateNotificationField('isRead', true, notificationId);

        if (resIsClicked.success && resIsRead.success) {
            dispatch(updateNotification({ field: 'isClicked', value: true, _id: notificationId }));
            dispatch(updateNotification({ field: 'isRead', value: true, _id: notificationId }));
        }

    };

    const handleMenuOptions = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        const payload = {
            isOpen: true,
            notificationId: notification._id,
            senderId: notification.sender,
            mode: e.currentTarget.id as "delete" | "notification",
            isDisable: notification.isDisable
        };
        dispatch(toggleNotifyChangeDialog(payload));
    };

    return (
        <div
            key={notification._id}
            onClick={() => handleRouting(notification._id, (notification.slot || ''))}
            className={`relative flex items-start space-x-4 px-4 py-3 ${!notification.isRead ? "bg-blue-50" : "bg-white"
                } hover:bg-blue-100/40 transition-all cursor-pointer`}
        >
            <div className="relative w-12 h-12 rounded-overflow-hidden shrink-0">
                {!notification.isClicked && (
                    <div className="absolute -top-1 -left-1 w-4 h-4 flex items-center justify-center">
                        <span className="absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75 animate-ping"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600"></span>
                    </div>
                )}

                {/* Conditional rendering of Image component */}
                {notification.image ? (
                    <Image
                        src={notification.image}
                        width={40}
                        height={40}
                        alt={notification.sender}
                        className="rounded-full"
                    />
                ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">No Image</span>
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{notification.name}</p>
                <p className="text-sm text-gray-600 line-clamp-2">
                    {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    {getNotificationTime(new Date(notification.createdAt))} ago
                </p>
            </div>
            <div className="relative">
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleMenu(notification._id); }}
                    className="p-1 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                    <MoreVertical className="w-5 h-5" />
                </button>

                {openMenus[notification._id] && (
                    <div className="absolute right-0 mt-1 w-44 max-w-[16rem] bg-white rounded-md shadow-md border z-50">
                        <button
                            id="notification"
                            onClick={handleMenuOptions}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                        >
                            Change preference
                        </button>
                        <button
                            id="delete"
                            onClick={handleMenuOptions}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-500 cursor-pointer"
                        >
                            Delete notification
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationCard;
