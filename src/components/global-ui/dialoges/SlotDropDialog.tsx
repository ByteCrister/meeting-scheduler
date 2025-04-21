"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toggleSlotDropDialog } from '@/lib/features/component-state/componentSlice';
import { deleteSlot } from '@/lib/features/Slots/SlotSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import apiService from '@/utils/client/api/api-services';
import React, { useState } from 'react';
import LoadingSpinner from '../ui-component/LoadingSpinner';
import { deleteSlotsFromUserRegisterSlots } from '@/lib/features/users/userSlice';

const SlotDropDialog = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { slotDropDialog } = useAppSelector(state => state.componentStore);
    const dispatch = useAppDispatch();

    const handleToggleChange = () => {
        dispatch(toggleSlotDropDialog({ isOpen: false, slotTitle: null, slotId: null }));
    };

    const handleDropSlot = async () => {
        setIsLoading(true);
        const responseDate = await apiService.delete(`/api/user-slot-register`, { slotId: slotDropDialog?.slotId });
        if (responseDate.success) {
            dispatch(toggleSlotDropDialog({ isOpen: false, slotTitle: null, slotId: null }));
            dispatch(deleteSlot(slotDropDialog.slotId!));
            dispatch(deleteSlotsFromUserRegisterSlots(slotDropDialog.slotId!));
        }
        setIsLoading(false);
    };

    return (
        <Dialog open={slotDropDialog.isOpen} onOpenChange={handleToggleChange}>
            <DialogContent className="sm:max-w-md p-0 border-none shadow-xl rounded-xl bg-white">
                <div className="p-6 space-y-5">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-blue-900 font-poppins">
                            Confirm Slot Drop
                        </DialogTitle>
                        <DialogDescription className="text-blue-800 font-poppins">
                            Are you sure you want to drop this slot?
                            <br />
                            <span className="text-blue-900 font-semibold">Title:</span> {slotDropDialog.slotTitle}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex gap-3 justify-end pt-4">
                        <button
                            type="button"
                            onClick={handleToggleChange}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md transition-colors text-sm font-medium font-poppins cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleDropSlot}
                            disabled={isLoading}
                            className={`${isLoading
                                    ? 'bg-none cursor-not-allowed'
                                    : 'bg-red-500 hover:bg-red-600 text-white'
                                } px-4 py-2 rounded-md transition-colors text-sm font-medium font-poppins flex items-center gap-2 cursor-pointer`}
                        >
                            {isLoading && <LoadingSpinner />}
                            {!isLoading ? 'Drop Slot' : ''}
                        </button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SlotDropDialog;
