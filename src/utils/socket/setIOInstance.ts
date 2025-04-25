import { Server as SocketIOServer } from "socket.io";

declare global {
    // eslint-disable-next-line no-var
    var _io: SocketIOServer | undefined;
}

export const setIOInstance = (instance: SocketIOServer) => {
    if (!global._io) {
        global._io = instance;
    } else {
        console.log("Socket.IO instance is already initialized.");
    }
};

export const getIOInstance = (): SocketIOServer | undefined => {
    return global._io;
};
