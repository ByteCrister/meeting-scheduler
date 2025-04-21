// src/components/utils/client/socket/NotificationSocketProvider.tsx
"use client";

import useNotificationSocket from "@/hooks/useNotificationSocket";


const NotificationSocketProvider = () => {
  useNotificationSocket(); 
  return null; 
};

export default NotificationSocketProvider;