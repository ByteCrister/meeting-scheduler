'use client';

import { Button } from '@/components/ui/button'
import { addNewSlot, updateSlot } from '@/lib/features/Slots/SlotSlice';
import { addSingleActivity, addSlotToUserRegisterSlots } from '@/lib/features/users/userSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import apiService from '@/utils/client/api/api-services';
import React, { useState } from 'react'
import ShowToaster from '../../toastify-toaster/show-toaster';
import LoadingUIBlackBullfrog from '../../ui-component/LoadingUIBlackBullfrog';

const Footer = ({ setOpen }: { setOpen: () => void; }) => {
    const { slotField, mode } = useAppSelector(state => state.componentStore.slotDialog);
    const dispatch = useAppDispatch();

    const [isLoading, setIsLoading] = useState<boolean>();

    const handleFiledValidation = () => {
        const validators: { [key: number]: () => boolean } = {
            1: () => slotField.title.trim() !== '' && slotField.category.trim() !== '' && slotField.description.trim() !== '',
            2: () => !!slotField.meetingDate && slotField.durationFrom.trim() !== '' && slotField.durationTo.trim() !== '',
            3: () => slotField.guestSize > 0,
        };

        const isValid = validators[1]?.() && validators[2]?.() && validators[3]?.();

        if (isValid) {
            handleSlotCreateOrUpdateAPI();// * For Create & Update
        } else {
            ShowToaster("Please fill the fields properly.", 'warning');
        }
    };


    const handleSlotCreateOrUpdateAPI = async () => {
        setIsLoading(true);
        const responseData = await apiService.post(`/api/user-slot-register?type=${mode}`, slotField);
        if (responseData.success) {
            if (mode === 'update') {
                setOpen();
                dispatch(updateSlot(responseData.slot));
            } else if (mode === 'create') {
                setOpen();
                dispatch(addNewSlot(responseData.slot));
                dispatch(addSingleActivity({
                    id: responseData.slot._id,
                    title: responseData.slot.title,
                    time: responseData.slot.durationFrom,
                    type: 'upcoming'
                }));
                dispatch(addSlotToUserRegisterSlots(responseData.slot._id));
            }
            ShowToaster(responseData.message, 'success');
        }
        setIsLoading(false);
    };
    return (
        <>
            {
                isLoading
                    ? <LoadingUIBlackBullfrog />
                    : <div className="pt-4 flex flex-col sm:flex-row sm:justify-end gap-2 border-t border-gray-200 mt-4">
                        <Button
                            variant="outline"
                            name='close'
                            className="text-sm font-medium border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer"
                            onClick={() => setOpen()}
                        >
                            Close
                        </Button>
                        <Button
                            name='create-update'
                            onClick={handleFiledValidation}
                            className="text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 rounded-lg px-6 py-2 transition-all duration-300 shadow-md cursor-pointer"
                        >
                            {mode === "create" ? "Create Meeting" : "Update Meeting"}
                        </Button>
                    </div>
            }
        </>
    )
}

export default Footer