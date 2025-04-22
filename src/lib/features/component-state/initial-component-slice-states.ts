import { initialComponentStateTypes, RegisterSlotStatus } from "@/types/client-types";

// * slotDialog: { slotField: <- }
export const initialSlotField = {
    _id: '',
    title: '',
    category: '',
    description: '',
    meetingDate: '',
    tags: [],
    durationFrom: '',
    durationTo: '',
    guestSize: 1,
    bookedUsers: [],
    trendScore: 0,
    engagementRate: 0,
    status: RegisterSlotStatus.Upcoming,
    createdAt: '',
    updatedAt: ''
};

export const initialComponentState: initialComponentStateTypes = {
    alertLogOut: { isOpen: false },
    alertDialogState: { isOpen: false, title: '', description: '' },
    friendDropDialog: { isOpen: false, user: null },
    slotDialog: { isOpen: false, mode: 'create', slotField: initialSlotField },
    slotDropDialog: { isOpen: false, slotTitle: null, slotId: null },
    notifyChangeDialog: { isOpen: false, notificationId: null, senderId: null, mode: 'notification', isDisable: false },
    profileUpdateDialog: { isOpen: false, updateField: null, username: null, title: null, category: null, timeZone: null, image: null },
    deleteBookedSlotAlert: { isOpen: false, slotId: null },
    viewBookedSlotDialog: { isOpen: false, Slot: null }
};