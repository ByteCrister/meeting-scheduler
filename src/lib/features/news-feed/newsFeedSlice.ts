import { newsFeedSliceInitialTypes, NewsFeedTypes } from "@/types/client-types";
import { NotificationType } from "@/utils/constants";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialNewsFeed: newsFeedSliceInitialTypes = {
    newsFeeds: {}
}

const newsFeedSlice = createSlice({
    name: 'newsFeedSlice',
    initialState: initialNewsFeed,
    reducers: {
        addNewsFeeds: (state, action: PayloadAction<{ [key: string]: NewsFeedTypes }>) => {
            const newFeeds = action.payload;
            let hasNew = false;

            Object.keys(newFeeds).forEach(key => {
                if (!state.newsFeeds[key]) {
                    hasNew = true;
                    state.newsFeeds[key] = newFeeds[key];
                }
            });

            // Only mark new state if something was truly added
            if (!hasNew) {
                // Optional: trigger a toast or set `hasMore` false at fetch level
                console.log("No new feeds added");
            }
        },

        updateSlotBookedUsers: (state, action: PayloadAction<{ slotId: string, userId: string, type: (NotificationType.SLOT_UNBOOKED | NotificationType.SLOT_BOOKED) }>) => {
            const slot = state.newsFeeds[action.payload.slotId];
            if (slot) {
                const slotId = action.payload.slotId;
                const type = action.payload.type;
                const userId = action.payload.userId;
                if (type === NotificationType.SLOT_BOOKED && userId) state.newsFeeds[slotId].bookedUsers.unshift(userId as string);
                else state.newsFeeds[slotId].bookedUsers = slot.bookedUsers.filter((user_id) => user_id !== userId as string);
            }
        },
        toggleIsSlotBooking: (state, action: PayloadAction<{ slotId: string, isBooking: boolean }>) => {
            const slot = state.newsFeeds[action.payload.slotId];
            if (slot) {
                state.newsFeeds[action.payload.slotId].isBooking = action.payload.isBooking;
            }
        },
        removeNewsFeedSlot: (state, action: PayloadAction<string>) => {
            delete state.newsFeeds[action.payload];
        }
    }
});

export const {
    addNewsFeeds,
    updateSlotBookedUsers,
    toggleIsSlotBooking,
    removeNewsFeedSlot,
} = newsFeedSlice.actions;
export default newsFeedSlice;