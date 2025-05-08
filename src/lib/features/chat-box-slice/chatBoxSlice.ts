
import { chatBoxSliceTypes, chatBoxUserChatType, chatBoxUserListType, chatBoxUserType } from "@/types/client-types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: chatBoxSliceTypes = {
    countOfUnseenMessages: 0,
    chatBoxUserList: [],
    activeUserChat: { user: null, chats: [] }
};

const chatBoxSlice = createSlice({
    name: 'chatBoxSlice',
    initialState: initialState,
    reducers: {
        setChatBoxActiveUser: (state, action: PayloadAction<chatBoxUserType>) => {
            state.activeUserChat.user = action.payload;
        },
        setActiveUserChats: (state, action: PayloadAction<chatBoxUserChatType[]>) => {
            state.activeUserChat.chats = action.payload;
        },
        setChatBoxUserList: (state, action: PayloadAction<chatBoxUserListType[]>) => {
            state.chatBoxUserList = action.payload;
        },
        setCountOfUnseenMessage: (state, action: PayloadAction<number>) => {
            state.countOfUnseenMessages = action.payload;
        },
        updateChatBoxUserList: (state, action: PayloadAction<{ _id: string, keyField: string, value: string | boolean }>) => {
            state.chatBoxUserList = state.chatBoxUserList.map((item) => {
                return item._id === action.payload._id
                    ? { ...item, [action.payload.keyField]: action.payload.value } : item;
            })
        },
        addNewMessage: (state, action: PayloadAction<chatBoxUserChatType>) => {
            state.activeUserChat.chats.push(action.payload);
        },
        deleteChatMessage: (state, action: PayloadAction<string>) => {
            state.activeUserChat.chats = state.activeUserChat.chats.filter((chat) => chat._id !== action.payload);
        }

    }
});

export const {
    setChatBoxActiveUser,
    setActiveUserChats,
    setChatBoxUserList,
    setCountOfUnseenMessage,
    updateChatBoxUserList,
    addNewMessage,
    deleteChatMessage
} = chatBoxSlice.actions;
export default chatBoxSlice;