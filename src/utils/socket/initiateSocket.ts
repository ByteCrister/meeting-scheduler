// src>utils>socket>initialSocket.ts

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initiateSocket = () => {
    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_DOMAIN, {
            path: process.env.SOCKET_PATH || "/api/socket", // /api/socket
            withCredentials: true, // Ensure credentials are sent with the connection
            transports: ["websocket"],
            reconnectionAttempts: 5, // Retry connection 5 times
            reconnectionDelay: 1000, // Delay between reconnection attempts (in ms)
        });

        socket.on("connect", () => {
            console.log("Socket connected:", socket?.id);
        });

        socket.on("connect_error", (error) => {
            console.log("Socket connection error:", error);
        });

        socket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
        });
    }

    return socket;
};

export const getSocket = (): Socket => {
    return initiateSocket();
};