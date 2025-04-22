
import { BookedSlotsTypes } from "@/types/client-types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { isEqual } from "lodash";

interface initialStateType {
    Store: BookedSlotsTypes[];
    bookedMeetings: BookedSlotsTypes[];
    currentPage: number;
}

const initialState: initialStateType = {
    Store: [],
    bookedMeetings: [],
    currentPage: 1
};

const meetingSlice = createSlice({
    name: 'meetingSlice',
    initialState: initialState,
    reducers: {
        // * Manage booked meeting slots
        addBookedMeetings: (state, action: PayloadAction<BookedSlotsTypes[]>) => {
            const isSame = isEqual(state.Store, action.payload);
            if (!isSame) {
                state.Store = [...state.Store, ...action.payload];
                state.bookedMeetings = [...state.bookedMeetings, ...action.payload];
            }
        },
        addSingleBookedMeeting: (state, action: PayloadAction<BookedSlotsTypes>) => {
            state.Store.unshift(action.payload);
            state.bookedMeetings.unshift(action.payload);
        },
        setSortedBookedMeetings: (state, action: PayloadAction<BookedSlotsTypes[]>) => {
            state.bookedMeetings = [...action.payload];
        },

        // * Update current page
        setBookedMeetingCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload > 0 ? action.payload : 1;
        },

    }
});

export const {
    addBookedMeetings,
    addSingleBookedMeeting,
    setSortedBookedMeetings,
    setBookedMeetingCurrentPage
} = meetingSlice.actions;
export default meetingSlice;