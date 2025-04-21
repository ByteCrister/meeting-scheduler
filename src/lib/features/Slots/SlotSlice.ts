import { registerSlot } from "@/types/client-types"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { isEqual } from "lodash";

interface InitialSlotSliceTypes {
    Store: registerSlot[];
    tempStore: registerSlot[];
    currentSlotPage: number;
}

const initialSlotSliceState: InitialSlotSliceTypes = {
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
        sortTempSlots: (state, action: PayloadAction<registerSlot[]>) => {
            state.tempStore = action.payload;
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
        }
    }
});

export const {
    addSlots,
    updateSlot,
    sortTempSlots,
    addNewSlot,
    deleteSlot,
    setCurrentPage
} = slotSlice.actions;

export default slotSlice;