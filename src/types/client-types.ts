import { FriendTypes } from "@/components/followers/Followers";
import { NotificationType } from "@/utils/constants";

// ? booked meeting slot types
export type BookedSlotsTypes = Omit<
    registerSlot,
    | "guestSize"
    | "bookedUsers"
    | "trendScore"
    | "engagementRate"
    | "createdAt"
    | "updatedAt"
> & {
    creatorId: string;
    creator: string;
};


// ? Notification types
export interface Notification {
    _id: string;
    type: NotificationType;
    sender: string;
    receiver: string;
    name: string;
    image: string;
    post?: string;
    slot?: string;
    message: string;
    isRead: boolean;
    isClicked: boolean;
    isDisable: boolean;
    createdAt: string;
}

// ? Register slots type starts... not using
export enum RepeatState {
    Once = "once",
    Day = "day",
    Week = "week",
    Month = "month"
}

export enum RegisterSlotStatus {
    Upcoming = "upcoming",
    Ongoing = "ongoing",
    Completed = "completed",
    Expired = "expired"
}

export interface registerSlot {
    _id: string;
    title: string;
    category: string;
    description: string;
    meetingDate: string | undefined;
    tags: string[];
    durationFrom: string;
    durationTo: string;
    guestSize: number;
    bookedUsers: string[];
    trendScore: number;
    engagementRate: number;
    status: RegisterSlotStatus;
    createdAt: string;
    updatedAt: string;
}
// ! register slots type ...ends


// ! Meeting feed types
export interface NewsFeedTypes {
    _id: string;
    owner: {
        username: string;
        image: string;
    };
    title: string;
    description: string;
    tags: string[];
    meetingDate: string;
    durationFrom: string;
    durationTo: string;
    guestSize: number;
    bookedUsers: string[];
    isBooking: boolean;
}


// ? User type starts...
export interface bookedSlots {
    userId: string;
    slotIndex: number;
    status: "upcoming" | "ongoing" | "expired";
}
export interface Users {
    _id: string;
    username: string;
    email: string;
    image: string;
    title: string;
    profession: string;
    timeZone: string;
    searchScore: number;
    trendScore: number;
    followers: { userId: string, startedFrom: Date }[];
    following: { userId: string, startedFrom: Date }[];
    bookedSlots: bookedSlots[];
    registeredSlots: string[];
    disabledNotificationUsers: string[];
    countOfNotifications: number; // * Count's new notifications after refreshing number of notification's
    isNewsFeedRefreshed: boolean;
    createdAt: Date;
    updatedAt: Date;
}
// ! User type ends...


export interface ActivityType {
    id: string;
    title: string;
    time: string;
    type: 'upcoming' | 'recent' | 'available';
}

export interface reduxUsersInitialState {
    user: Users | null;
    notifications: Notification [] | null;
    activities: ActivityType[] | null;
}

// * Types of initial-values on redux component slice 
export interface initialComponentStateTypes {
    alertLogOut: {
        isOpen: boolean
    };
    alertDialogState: {
        isOpen: boolean;
        title: string;
        description: string;
    };
    friendDropDialog: {
        isOpen: boolean,
        user: FriendTypes | null
    };
    slotDialog: {
        isOpen: boolean;
        mode: 'create' | 'update' | 'view';
        slotField: registerSlot
    };
    slotDropDialog: {
        isOpen: boolean;
        slotTitle: string | null;
        slotId: string | null;
    };
    notifyChangeDialog: {
        isOpen: boolean;
        notificationId: null | string;
        senderId: null | string;
        mode: ('notification' | 'delete');
        isDisable: boolean;
    };
    profileUpdateDialog: {
        isOpen: boolean;
        updateField: (null | "image" | "bio" | "details");
        username: null | string;
        title: null | string;
        category: null | string;
        timeZone: null | string;
        image: null | string;
    };
    deleteBookedSlotAlert: {
        isOpen: boolean;
        slotId: null | string;
    };
    viewBookedSlotDialog: {
        isOpen: boolean;
        Slot: null | BookedSlotsTypes;
    }
}

// * Friend Zone types....
export interface initialFriendZoneTypes {
    friendListStore: FriendTypes[] | null;
    friendList: FriendTypes[] | null;
    currentPage: number;
}

// ? User Form Types
export type userSignUpType = {
    username: string;
    email: string;
    password: string;
    image: string,
    profession: string,
    timeZone: string
}
export type userSignInType = {
    email: string;
    password: string;
}


// ? New Feed Types 
export interface initialNewsFeedTypes {
    newsFeeds: { [key: string]: NewsFeedTypes }
}