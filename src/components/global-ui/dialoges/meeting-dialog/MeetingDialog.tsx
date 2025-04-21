'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import TitleCategory from './TitleCategory';
import DateTimePicker from './DateTimePicker';
import TagsGuest from './TagsGuest';
import Footer from './Footer';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { toggleSlotDialog } from '@/lib/features/component-state/componentSlice';
import { setCurrentPage } from '@/lib/features/Slots/SlotSlice';
// import { format } from 'date-fns';
// import { cn } from '@/lib/utils'; 

const MeetingDialog = () => {
    const { isOpen, mode } = useAppSelector(state => state.componentStore.slotDialog);
    const dispatch = useAppDispatch();

    const setOpen = () => {
        dispatch(toggleSlotDialog({ isOpen: false, mode: 'create' }));
        setCurrentPage(1);
    };

    const dialogTitle = mode === 'create'
        ? 'Register a New Slot'
        : mode === 'update'
            ? 'Update Slot Information'
            : 'View Slot Information';

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>

            <DialogContent className="max-w-xl w-full max-h-[80vh] overflow-y-auto p-4 sm:p-6 space-y-6 rounded-2xl shadow-xl">

                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                        {dialogTitle}
                    </DialogTitle>
                </DialogHeader>

                {/* Title, category & description */}
                <TitleCategory />

                {/* Date & Time Picker */}
                <DateTimePicker />

                {/* Tags & guests */}
                <TagsGuest />

                {/* Footer buttons */}
                <Footer setOpen={setOpen}/>

            </DialogContent>
        </Dialog>
    );
};

export default MeetingDialog;