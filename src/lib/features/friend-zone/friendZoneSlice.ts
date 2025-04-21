import { FriendTypes } from "@/components/followers/Followers";
import { initialFriendZoneTypes } from "@/types/client-types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { isEqual } from "lodash";

const initialState: initialFriendZoneTypes = {
    friendListStore: null,
    friendList: null,
    currentPage: 1
}

const friendZoneSlice = createSlice({
    name: 'friendZone',
    initialState: initialState,
    reducers: {
        // * FriendList section
        setFriendList: (state, action: PayloadAction<FriendTypes[] | null>) => {
            const isSame = isEqual(state.friendListStore, action.payload);
            if(!isSame){
                state.friendListStore = action.payload;
                state.friendList = action.payload;
            }
        },
        addNewFriend: (state, action: PayloadAction<FriendTypes>) => {
            state.friendList?.unshift(action.payload);
        },
        setSortedFriendList: (state, action: PayloadAction<FriendTypes[]>) => {
            state.friendList = action.payload;
        },
        toggleIsRemoved: (state, action: PayloadAction<{ id: string, isRemoved: boolean }>) => {
            state.friendList = state.friendList?.map((item) => item.id === action.payload.id ? { ...item, isRemoved: action.payload.isRemoved } : item) || [];
        },
        toggleIsBtnLoading: (state, action: PayloadAction<{ id: string, isLoading: boolean }>) => {
            state.friendList = state.friendList?.map((item) => item.id === action.payload.id ? { ...item, isLoading: action.payload.isLoading } : item) || [];
        },
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload > 0 ? action.payload : 1;
        }
    }
});

export const { setFriendList, addNewFriend, toggleIsRemoved, toggleIsBtnLoading, setSortedFriendList, setCurrentPage } = friendZoneSlice.actions;
export default friendZoneSlice;