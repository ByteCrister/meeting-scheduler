import { NextApiResponse } from "next";
import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";

export interface feedMapSlotType {
    _id: string;
    title: string;
    description: string;
    meetingDate: string;
    createdAt: string;
    durationFrom: string;
    durationTo: string;
    guestSize: number;
    bookedUsers: string[];
    tags: string[];
    owner: { username: string, image: string };
    isBooking: boolean;
}

export type NextApiResponseWithSocket = NextApiResponse & {
    socket: {
        server: NetServer & {
            io?: SocketIOServer;
        };
    };
};