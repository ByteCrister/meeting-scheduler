import { chatBoxUserChatType, chatBoxUserType } from "@/types/client-types";
import { ApiChatBoxMessageType } from "@/utils/constants";
import axios from "axios";
import apiService from "./api-services";

// ? using same function to get messages and chatted user info
export const getChatMessagesOrUser = async (type: ApiChatBoxMessageType, selectedFriendId?: string
): Promise<chatBoxUserChatType[] | chatBoxUserType> => {
    const res = await axios.get(
        `/api/chatbox/message`,
        { params: { selectedFriendId, type } }
    );
    if (!res.data.success) {
        return type === ApiChatBoxMessageType.GET_MESSAGES
            ? []
            : { _id: "", username: "", image: "" }; // ! Fallback case
    }
    return res.data.data;
};

// ? get chatbox user list
export const getChatBoxUserList = async () => {
    const resData = await apiService.get(`/api/chatbox`);
    if (!resData.success) {
        return [];
    };
    return resData.data;
};


// ? sending messages
export const sendMessage = async (recipientId: string, message: string) => {
    const resData = await apiService.post(`/api/chatbox/message`, {
        recipientId,
        message,
    });
    if (!resData.success) {
        return null;
    }

    return resData.data;
};

// ? delete messages
export const deleteMessage = async (
    participantId: string,
    messageId: string
) => {
    const resData = await apiService.delete(`/api/chatbox/message`, {
        participantId,
        messageId,
    });

    if (!resData.success) {
        return false;
    }
    return resData.success;
};


export const resetUnseenMessageCount = async (participantId: string) => {
    const resData = await apiService.put(`/api/chatbox/message`, { participantId, type: ApiChatBoxMessageType.RESET_UNSEEN_MESSAGE_COUNT });
    if (!resData.success) return false;

    return resData.success;
};