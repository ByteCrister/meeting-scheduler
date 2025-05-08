import { FriendTypes } from "@/components/followers/Followers";
import { NotificationType } from "@/utils/constants";

// * Booked meeting slot Type
export type BookedSlotsTypes = Omit<
    registerSlot,
    | "guestSize"
    | "bookedUsers"
    | "trendScore"
    | "engagementRate"
    | "createdAt"
    | "updatedAt"
> & {
    timeZone: string;
    creatorId: string;
    creator: string;
};
// ? --------------- end ----------------


// * Notification Type
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

// * Register slots Type
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
// ? ---------------- end ---------------


// * Popular Meeting Type
export interface PopularMeeting {
    _id: string;
    title: string;
    meetingDate: string;
    guestSize: number;
    totalParticipants: number;
    engagementRate: number;
    category: string;
    status: RegisterSlotStatus.Upcoming | RegisterSlotStatus.Ongoing | RegisterSlotStatus.Completed;
    description: string;
    tags: string[];
    durationFrom: string,
    durationTo: string
}
// ? ---------------- end ---------------


// ! Meeting feed types
export interface NewsFeedTypes {
    _id: string;
    owner: {
        username: string;
        image: string;
        owner_id: string;
        timeZone: string;
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


// ? Booked Meeting slot type
export interface bookedSlots {
    userId: string;
    slotIndex: number;
    status: "upcoming" | "ongoing" | "expired";
}

// ! User type
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

export interface ActivityType {
    id: string;
    title: string;
    time: string;
    type: 'upcoming' | 'recent' | 'available';
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



// ! -------------------- Slice Types -----------------------

// ? New Feed Types 
export interface newsFeedSliceInitialTypes {
    newsFeeds: { [key: string]: NewsFeedTypes }
}

// ? Types of component slice 
export interface componentSliceInitialTypes {
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

// ? Friend Zone types
export interface friendZoneSliceInitialTypes {
    friendListStore: FriendTypes[] | null;
    friendList: FriendTypes[] | null;
    currentPage: number;
}

// ? Chat Box Slice types
export interface chatBoxUserListType {
    _id: string;
    username: string;
    email: string;
    image: string;
    newUnseenMessages: number;
    online: boolean
}
export interface chatBoxUserType {
    _id: string;
    username: string;
    image: string;
}
export interface chatBoxUserChatType {
    _id: string;
    user_id: string;
    message: string;
    createdAt: string;
}
export interface chatBoxSliceTypes {
    countOfUnseenMessages: number;
    chatBoxUserList: chatBoxUserListType[];
    activeUserChat: {
        user: chatBoxUserType | null,
        chats: chatBoxUserChatType[]
    }
}

// ? User slice
export interface userSliceInitialState {
    user: Users | null;
    notifications: Notification[] | null;
    activities: ActivityType[] | null;
    countOfUnseenMessages: number;
}