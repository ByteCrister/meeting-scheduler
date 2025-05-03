import { registerSlot, RegisterSlotStatus } from "@/types/client-types"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { isEqual } from "lodash";

interface slotSliceInitialTypes {
    Store: registerSlot[];
    tempStore: registerSlot[];
    currentSlotPage: number;
}

const initialSlotSliceState: slotSliceInitialTypes = {
    Store: [],
    tempStore: [],
    currentSlotPage: 1
}

const slotSlice = createSlice({
    name: 'slotSlice',
    initialState: initialSlotSliceState,
    reducers: {
        // * initialize slot data
        addSlots: (state, action: PayloadAction<registerSlot[]>) => {
            const isSame = isEqual(state.Store, action.payload);
            if (!isSame) {
                state.Store = [...state.Store, ...action.payload];
                state.tempStore = [...state.tempStore, ...action.payload];
            }
        },
        updateSlot: (state, action: PayloadAction<registerSlot>) => {
            state.Store = state.Store?.map((item) => item._id === action.payload._id ? action.payload : item);
            state.tempStore = state.tempStore?.map((item) => item._id === action.payload._id ? action.payload : item);
        },

        updateSlotStatus: (state, action: PayloadAction<{ slotId: string, newStatus: RegisterSlotStatus }>) => {
            state.Store = state.Store.map((item) => item._id === action.payload.slotId ? ({ ...item, status: action.payload.newStatus }) : item);
            state.tempStore = state.Store.map((item) => item._id === action.payload.slotId ? ({ ...item, status: action.payload.newStatus }) : item);
        },

        sortTempSlots: (state, action: PayloadAction<registerSlot[]>) => {
            state.tempStore = [...action.payload];
        },

        // * Update page info
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentSlotPage = action.payload > 0 ? action.payload : 1;
        },

        // * add single slot data
        addNewSlot: (state, action: PayloadAction<registerSlot>) => {
            state.Store.unshift(action.payload);
            state.tempStore.unshift(action.payload);
        },
        deleteSlot: (state, action: PayloadAction<string>) => {
            state.Store = state.Store.filter((item) => item._id !== action.payload);
            state.tempStore = state.tempStore.filter((item) => item._id !== action.payload);
        },

        // * Control booked users
        increaseBookedUsers: (state, action: PayloadAction<{ newBookedUserId: string, sloId: string }>) => {
            state.Store = state.Store.map((Slot) => Slot._id === action.payload.sloId ? { ...Slot, bookedUsers: [...Slot.bookedUsers, action.payload.newBookedUserId] } : Slot);
            state.tempStore = state.tempStore.map((Slot) => Slot._id === action.payload.sloId ? { ...Slot, bookedUsers: [...Slot.bookedUsers, action.payload.newBookedUserId] } : Slot);
        },
        decreaseBookedUsers: (state, action: PayloadAction<{ bookedUserId: string, sloId: string }>) => {
            state.Store = state.Store.map((Slot) => Slot._id === action.payload.sloId ? { ...Slot, bookedUsers: Slot.bookedUsers.filter(item => item !== action.payload.bookedUserId) } : Slot);
            state.tempStore = state.tempStore.map((Slot) => Slot._id === action.payload.sloId ? { ...Slot, bookedUsers: Slot.bookedUsers.filter(item => item !== action.payload.bookedUserId) } : Slot);
        },
    }
});

export const {
    addSlots,
    updateSlot,
    updateSlotStatus,
    sortTempSlots,
    addNewSlot,
    deleteSlot,
    setCurrentPage,
    increaseBookedUsers,
    decreaseBookedUsers
} = slotSlice.actions;

export default slotSlice;