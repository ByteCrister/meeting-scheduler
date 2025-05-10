import SlotModel from "@/models/SlotModel";
import ConnectDB from "./ConnectDB";
import UserModel from "@/models/UserModel";
import NotificationsModel from "@/models/NotificationsModel";
import VideoCallModel from "@/models/VideoCallModel";
import { ChatBoxModel } from "@/models/ChatBoxModel";

async function SyncIndexes() {
    try {
        await ConnectDB();

        await SlotModel.syncIndexes();

        await UserModel.syncIndexes();

        await NotificationsModel.syncIndexes();

        await VideoCallModel.syncIndexes();

        await ChatBoxModel.syncIndexes();

        process.exit(0);
    } catch (error) {
        console.error("Error syncing indexes:", (error as Error).message);
        process.exit(1);
    }
}

SyncIndexes();
