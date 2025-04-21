// src>utils>socket>setIOInstance.ts

import type { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer;

export const setIOInstance = (instance: SocketIOServer) => {
    io = instance;
};

export const getIOInstance = () => io;
