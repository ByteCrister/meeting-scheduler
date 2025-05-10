import { chatBoxUserChatType, chatBoxUserType } from "@/types/client-types";
import { ApiChatBoxMessageType } from "@/utils/constants";
import apiService from "./api-services";

// ? get chat messages
// ! when the chatbox is opened
// ! and when the user is selected from the chatbox list
// ! This is used to get the chat messages of a specific user
export const getChatMessages = async (
    type: ApiChatBoxMessageType.GET_MESSAGES,
    selectedFriendId?: string):
    Promise<chatBoxUserChatType[]> => {
    const res = await apiService.get(`/api/chatbox/message`, { selectedFriendId, type });
    if (!res.data?.success) {
        return []
    }
    return res.data.data;
};

// ? get active chatbox user
// ! This is used to get the active chatbox user when the chatbox is opened
// ! and also when the user is selected from the chatbox list
export const getLastParticipants = async (
    type: ApiChatBoxMessageType.GET_ACTIVE_USER,
    selectedFriendId?: string):
    Promise<{ data: chatBoxUserType, count: number }> => {
    const res = await apiService.get(`/api/chatbox/message`, { selectedFriendId, type });
    if (!res.data.success) {
        return { data: { _id: "", username: "", image: "" }, count: 0 };
    }
    return res.data;
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
export const sendMessage = async (participantsId: string, message: string) => {
    const resData = await apiService.post(`/api/chatbox/message`, { participantsId, message });
    if (!resData.success) {
        return null;
    }

    return resData.data;
};

// ? delete messages
export const deleteMessage = async (participantId: string, messageId: string) => {
    const resData = await apiService.delete(`/api/chatbox/message`, { participantId, messageId });
    if (!resData.success) {
        return false;
    }
    return resData.success;
};

// ? reset unseen message count
export const resetUnseenMessageCount = async (participantId: string) => {
    const resData = await apiService.put(`/api/chatbox/message`,
        {
            participantId,
            type: ApiChatBoxMessageType.RESET_UNSEEN_MESSAGE_COUNT
        });
    if (!resData.success) return false;

    return resData.success;
};

// ? Toggle chat box open/close status
export const toggleChatBoxStatus = async (isOpened: boolean) => {
    await apiService.put(`/api/chatbox/message`, {
        isOpened,
        type: ApiChatBoxMessageType.TOGGLE_IS_CHATBOX_OPEN
    });
    return true;
}