
import { BookedSlotsTypes, RegisterSlotStatus } from "@/types/client-types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface bookedSliceInitialType {
    Store: BookedSlotsTypes[];
    bookedMeetings: BookedSlotsTypes[];
    currentPage: number;
}

const initialState: bookedSliceInitialType = {
    Store: [],
    bookedMeetings: [],
    currentPage: 1
};

const meetingSlice = createSlice({
    name: 'meetingSlice',
    initialState: initialState,
    reducers: {
        addBookedMeetings: (state, action: PayloadAction<BookedSlotsTypes[]>) => {
            state.Store = action.payload;
            state.bookedMeetings = action.payload;
        },
        addSingleBookedMeeting: (state, action: PayloadAction<BookedSlotsTypes>) => {
            state.Store.unshift(action.payload);
            state.bookedMeetings.unshift(action.payload);
        },
        setSortedBookedMeetings: (state, action: PayloadAction<BookedSlotsTypes[]>) => {
            state.bookedMeetings = [...action.payload];
        },
        deleteBookedMeeting: (state, action: PayloadAction<string>) => {
            state.Store = state.Store.filter((item) => item._id !== action.payload);
            state.bookedMeetings = state.bookedMeetings.filter((item) => item._id !== action.payload);
        },
        updateBookedMeetingStatus: (state, action: PayloadAction<{ slotId: string, newStatus: RegisterSlotStatus }>) => {
            state.Store = state.Store.map((item) => item._id === action.payload.slotId ? { ...item, status: action.payload.newStatus } : item);
            state.bookedMeetings = state.bookedMeetings.map((item) => item._id === action.payload.slotId ? { ...item, status: action.payload.newStatus } : item);
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
    deleteBookedMeeting,
    updateBookedMeetingStatus,
    setBookedMeetingCurrentPage,
} = meetingSlice.actions;
export default meetingSlice;