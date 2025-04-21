'use client';

import { Calendar } from '@/components/ui/calendar'
import { setSlotFiledValues } from '@/lib/features/component-state/componentSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import React from 'react'
import TimePicker from './TimePicker';


const DateTimePicker = () => {
    const { slotField, mode } = useAppSelector(state => state.componentStore.slotDialog);

    const { meetingDate } = slotField;
    const dispatch = useAppDispatch();

    const isReadOnly = mode === 'view';

    // ? Handle date picker
    const handleDateChange = (selectedDate: Date | undefined) => {
        const offsetDate = selectedDate
            ? new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000)
            : undefined;

        const updatedValues = {
            ...slotField,
            meetingDate: offsetDate?.toISOString()
        };
        dispatch(setSlotFiledValues(updatedValues));
    };


    return (
        <>
            <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Pick a Date</p>
                <div className="flex justify-center">
                    <div className="scale-90 sm:scale-100">
                        <Calendar
                            mode="single"
                            selected={meetingDate ? new Date(meetingDate) : undefined}
                            initialFocus
                            disabled={(date) => {
                                const today = new Date()
                                today.setHours(0, 0, 0, 0) // remove time for accurate comparison
                                const tomorrow = new Date(today)
                                tomorrow.setDate(today.getDate() + 1)
                                return date < tomorrow || isReadOnly
                            }}
                            onSelect={(e) => handleDateChange(e)}
                        />
                    </div>
                </div>
            </div>

            {/* Time picker */}
            <TimePicker />
        </>
    )
}

export default DateTimePicker