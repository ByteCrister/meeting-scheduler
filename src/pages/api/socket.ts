// src/pages/api/socket.ts

import { Server as ServerIO } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";
import { SocketTriggerTypes } from "@/utils/constants";
import {
    getUserSocketId,
    registerUserSocket,
    removeUserSocket,
} from "@/utils/socket/socketUserMap";
import { setIOInstance } from "@/utils/socket/setIOInstance";

import '../../utils/cron/updateSlotStatus';

// Disable body parser for socket handling
export const config = {
    api: {
        bodyParser: false,
    },
};
let socketServerInitialized = false;

const ioHandler = (req: NextApiRequest, res: NextApiResponse) => {
    // Access the extended `http.Server` which includes `io`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const httpServer = (res.socket as unknown as { server: any }).server;

    if (!socketServerInitialized && httpServer && !httpServer.io) {
        console.log("Initializing new Socket.IO server...");

        // Initialize the Socket.IO server
        const io = new ServerIO(httpServer, {
            path: process.env.SOCKET_PATH!,
            cors: {
                origin: process.env.SOCKET_SERVER_URL!,
                methods: ["GET", "POST"],
                allowedHeaders: ["Content-Type", "Authorization"],
                credentials: true, // Allow cookies to be sent with requests
            },
        });

        // Attach the Socket.IO instance to the server object
        httpServer.io = io;
        setIOInstance(io);  // Set the global Socket.IO instance
        socketServerInitialized = true;

        // Socket.IO connection handling
        io.on("connection", (socket) => {
            console.log("->> Socket connected:", socket.id);

            socket.on(SocketTriggerTypes.REGISTER_USER, (data) => {
                console.log("-------------------------- User registered: ", data.userId + ' -----------------------------');
                registerUserSocket(data.userId, socket.id);
            });

            socket.on("disconnect", () => {
                console.log("__Socket disconnected:", socket.id);
                removeUserSocket(socket.id);
            });

            socket.on("send_notification", (data) => {
                const { userId, notificationData } = data;
                const userSocketId = getUserSocketId(userId);
                if (userSocketId) {
                    io.to(userSocketId).emit(SocketTriggerTypes.RECEIVED_NOTIFICATION, notificationData);
                    io.to(userSocketId).emit(SocketTriggerTypes.USER_SLOT_BOOKED, notificationData);
                    io.to(userSocketId).emit(SocketTriggerTypes.USER_SLOT_UNBOOKED, notificationData);
                }
            });
        });
    } else {
        console.log("**Socket.IO already running.**");
    }

    res.end();
};

export default ioHandler;
