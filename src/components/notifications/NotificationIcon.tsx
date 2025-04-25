"use client";

import React, { useEffect } from "react";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { ApiNotificationTypes } from "@/utils/constants";
import { addNotifications, resetCountOfNotifications } from "@/lib/features/users/userSlice";
import ApiStatusUpdate from "@/utils/client/api/api-status-update";
import NotificationCard from "./NotificationCard";
import { APIgetAllInitialNotifications } from "@/utils/client/api/api-notifications";
import { Notification } from "@/types/client-types";

const NotificationIcon = () => {
  const { notifications, user } = useAppSelector((state) => state.userStore);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchData = async () => {
      const responseData = await APIgetAllInitialNotifications();
      if (responseData.success) {
        dispatch(addNotifications(responseData.data as Notification[]));
      }
    };

    fetchData();
  }, [dispatch]);


  // ? API refresh unseen notification count
  const handleRefreshCount = async () => {
    if (user?.countOfNotifications !== 0) {
      const responseData = await ApiStatusUpdate(ApiNotificationTypes.REFRESH_NOTIFICATION);
      if (responseData.success) {
        console.log(responseData.data);
        dispatch(resetCountOfNotifications());
      }
    }
  };

  return (
    <div className="relative">
      <Popover>
        <PopoverTrigger asChild>
          <button onClick={handleRefreshCount} className="relative p-2 rounded-full hover:bg-blue-100/40 transition cursor-pointer">
            <Bell className="w-6 h-6 text-gray-700" />
            {user?.countOfNotifications !== 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full shadow">
                {user?.countOfNotifications}
              </span>
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-[22rem] rounded-xl border shadow-lg bg-white p-0 z-50 overflow-x-hidden"
        >
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">
              Notifications
            </h3>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
            {notifications?.map((notification, index) => (
              <NotificationCard key={notification._id + notification.createdAt + index} notification={notification} />
            ))}
            {notifications?.length === 0 && <div className="h-96 flex items-center justify-center divide-gray-100">You have no notifications.</div>}
          </div>

          <div className="p-4 border-t text-center">
            <div className="h-[1.5rem]"></div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default NotificationIcon;
