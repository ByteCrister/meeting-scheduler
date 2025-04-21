"use client";

import { ActivityType, Notification, reduxUsersInitialState, Users } from "@/types/client-types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// * initial state
const initialState: reduxUsersInitialState = {
    user: null,
    notifications: [],
    activities: null
};

// Creating user slice
export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<{user: Users, activity: ActivityType[]}>) => {
            state.user = action.payload.user;
            state.activities = action.payload.activity;
        },

        updateUserInfo: (state, action: PayloadAction<{ field: 'username' | 'image' | 'title' | 'timeZone' | 'profession', updatedValue: string }>) => {
            if (state.user)
                state.user = { ...state.user, [action.payload.field]: action.payload.updatedValue };
        },

        // ! ------------- user notification changes -------------
        // * isDisabled field is for change users notification's preference & can toggle it
        addNotifications: (state, action: PayloadAction<Notification[] | null>) => {
            if (action.payload) {
                state.notifications = [
                    ...(state.notifications ?? []),
                    ...action.payload
                ];
            }
        },
        addSingleNotification: (state, action: PayloadAction<Notification>) => {
            state.notifications?.unshift(action.payload);
        },
        updateNotification: (state, action: PayloadAction<{ field: string, value: boolean, _id: string }>) => {
            if (state.notifications) {
                state.notifications = state.notifications?.map((item) => {
                    return item._id === action.payload._id ? { ...item, [action.payload.field]: action.payload.value } : item
                });
            }
        },
        deleteNotification: (state, action: PayloadAction<string>) => {
            if (state.notifications) {
                state.notifications = state.notifications?.filter((item) => item._id !== action.payload);
            }
        },
        updateUserNotificationCount: (state, action: PayloadAction<number>) => {
            if (state.user) {
                state.user.countOfNotifications = action.payload;
            }
        },
        // ! ----------------------- end ------------------------


        // ? ----------------- Activities -----------------
        addActivities: (state, action: PayloadAction<ActivityType[]>) => {
            state.activities = action.payload;
        },
        addSingleActivity: (state, action: PayloadAction<ActivityType>) => {
            state.activities?.unshift(action.payload);
        },
        deleteActivity: (state, action: PayloadAction<string>) => {
            state.activities = state.activities?.filter((item) => item.id !== action.payload) || [];
        },
        // ? -------------------- end ---------------------


        // ! ------------------- slots management -----------------------
        addSlotToUserRegisterSlots: (state, action: PayloadAction<string>) => {
            state.user?.registeredSlots.unshift(action.payload);
        },
        deleteSlotsFromUserRegisterSlots: (state, action: PayloadAction<string>) => {
            if (Array.isArray(state.user?.registeredSlots)) {
                state.user.registeredSlots = state.user.registeredSlots.filter(
                    (slotId) => slotId !== action.payload
                );
            }
        },
    }
});

// Export actions and reducer
export const {
    setUser,
    updateUserInfo,
    addNotifications,
    addSingleNotification,
    updateNotification,
    updateUserNotificationCount,
    deleteNotification,
    addActivities,
    addSingleActivity,
    deleteActivity,
    addSlotToUserRegisterSlots,
    deleteSlotsFromUserRegisterSlots
} = userSlice.actions;
export default userSlice.reducer;