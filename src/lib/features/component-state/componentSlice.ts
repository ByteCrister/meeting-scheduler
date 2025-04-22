"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initialComponentState, initialSlotField } from "./initial-component-slice-states";
import { BookedSlotsTypes, registerSlot } from "@/types/client-types";
import { FriendTypes } from "@/components/followers/Followers";

const componentSlice = createSlice({
  name: "component",
  initialState: initialComponentState,
  reducers: {

    setFriendDropDialog: (state, action: PayloadAction<{ isOpen: boolean; user: FriendTypes | null; }>) => {
      state.friendDropDialog = action.payload;
    },

    // ! -------( register slots ) My Slot Dialog -------
    setSlotFiledValues: (state, action: PayloadAction<registerSlot>) => {
      state.slotDialog.slotField = action.payload;
    },
    toggleSlotDialog: (state, action: PayloadAction<{ isOpen: boolean, mode: ('create' | 'view' | 'update') }>) => {
      state.slotDialog.isOpen = action.payload.isOpen;
      state.slotDialog.mode = action.payload.mode;
      if (!action.payload.isOpen) {
        state.slotDialog.slotField = initialSlotField;
      }
    },
    toggleSlotDropDialog: (state, action: PayloadAction<{ isOpen: boolean, slotTitle: string | null, slotId: string | null }>) => {
      state.slotDropDialog = action.payload;
    },
    // ! -------------------- end -----------------------

    // ? ---------- Booked Slot Dialog -----------
    toggleDeleteBookedSlotAlert: (state, action: PayloadAction<{ isOpen: boolean, slotId: (string | null) }>) => {
      state.deleteBookedSlotAlert = action.payload;
    },
    toggleViewBookedSlot: (state, action: PayloadAction<{ isOpen: boolean, Slot: null | BookedSlotsTypes }>) => {
      state.viewBookedSlotDialog = action.payload;
    },
    // ? ---------------- end --------------------

    // ? For any kind of alert toggle this
    toggleAlertDialog: (state, action: PayloadAction<{ isOpen: boolean, title: string, description: string }>) => {
      state.alertDialogState = action.payload;
    },
    // ? Notification edit or delete dialog
    toggleNotifyChangeDialog: (state, action: PayloadAction<{ isOpen: boolean, notificationId: string | null, senderId: string | null, mode: 'notification' | 'delete', isDisable: boolean }>) => {
      state.notifyChangeDialog = { ...action.payload };
    },
    // * Profile update dialog
    toggleUpdateProfileDialog: (state, action: PayloadAction<{ isOpen: boolean, updateField: null | "image" | "bio" | "details", image: null | string, username: null | string, title: null | string, category: null | string, timeZone: null | string }>) => {
      state.profileUpdateDialog = { ...action.payload };
    },
    // * Logout alert
    toggleAlertLogOut: (state, action: PayloadAction<boolean>) => {
      state.alertLogOut.isOpen = action.payload;
    },
  },
});

export const {
  setFriendDropDialog,
  setSlotFiledValues,
  toggleAlertLogOut,
  toggleAlertDialog,
  toggleSlotDialog,
  toggleSlotDropDialog,
  toggleNotifyChangeDialog,
  toggleUpdateProfileDialog,
  toggleDeleteBookedSlotAlert,
  toggleViewBookedSlot
} = componentSlice.actions;

export default componentSlice;