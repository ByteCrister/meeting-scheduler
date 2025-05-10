"use client";

import { ActivityType, Notification, userSliceInitialState, Users } from "@/types/client-types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { isEqual } from "lodash";

const initialState: userSliceInitialState = {
    user: null,
    notifications: [],
    activities: null,
};

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<{ user: Users, activity: ActivityType[] }>) => {
            const isSameUser = isEqual(state.user, action.payload.user);
            const isSameActivities = isEqual(state.user, action.payload.user);

            if (!isSameUser) state.user = action.payload.user;
            if (!isSameActivities) state.activities = action.payload.activity;
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
        incrementNotificationCount: (state) => {
            if (state.user) {
                state.user.countOfNotifications += 1;
            }
        },
        resetCountOfNotifications: (state) => {
            if (state.user) {
                state.user.countOfNotifications = 0;
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
    incrementNotificationCount,
    resetCountOfNotifications,
    deleteNotification,
    addActivities,
    addSingleActivity,
    deleteActivity,
    addSlotToUserRegisterSlots,
    deleteSlotsFromUserRegisterSlots
} = userSlice.actions;
export default userSlice.reducer;