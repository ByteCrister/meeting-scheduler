'use client';

import { Input } from '@/components/ui/input'
import { setSlotFiledValues } from '@/lib/features/component-state/componentSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import React, { useEffect, useState } from 'react'
import ShowToaster from '../../toastify-toaster/show-toaster';

interface BusyTime {
    from: string;
    to: string;
}

const convertTo24Hour = (time: string) => {
    if (!time) return "00:00";

    // If time is already in 24-hour format, like "20:08"
    if (/^\d{2}:\d{2}$/.test(time)) {
        return time;
    }

    // If time is in 12-hour format like "08:30 PM"
    const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) {
        console.warn("Unrecognized time format:", time);
        return "00:00"; // fallback
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, hour, min, period] = match;
    let h = parseInt(hour, 10);
    if (period.toUpperCase() === "PM" && h !== 12) h += 12;
    if (period.toUpperCase() === "AM" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${min}`;
};


const isTimeRangeAvailable = (from: string, to: string, busyTimes: BusyTime[]) => {
    const start = new Date(`1970-01-01T${convertTo24Hour(from)}`).getTime();
    const end = new Date(`1970-01-01T${convertTo24Hour(to)}`).getTime();

    // Total available time in ms
    const selectedDuration = end - start;

    // Accumulate total overlap duration
    let overlapDuration = 0;

    for (const { from: busyFrom, to: busyTo } of busyTimes) {
        const busyStart = new Date(`1970-01-01T${convertTo24Hour(busyFrom)}`).getTime();
        const busyEnd = new Date(`1970-01-01T${convertTo24Hour(busyTo)}`).getTime();

        // Calculate overlapping interval
        const overlapStart = Math.max(start, busyStart);
        const overlapEnd = Math.min(end, busyEnd);

        if (overlapStart < overlapEnd) {
            overlapDuration += overlapEnd - overlapStart;
        }
    }

    // If overlap covers the whole selected time, it's not available
    return overlapDuration < selectedDuration;
};


const TimePicker = () => {
    const MeetingSlots = useAppSelector(state => state.slotStore.Store);

    const { slotDialog } = useAppSelector((state) => state.componentStore);
    const dispatch = useAppDispatch();

    const isReadOnly = slotDialog.mode === 'view';

    const [busyTimes, setBusyTimes] = useState<BusyTime[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, keyFiled: string) => {
        const updatedValues = {
            ...slotDialog.slotField,
            [keyFiled]: e.target.value,
        };

        if (keyFiled === "durationTo" && updatedValues.durationFrom && e.target.value) {
            const isAvailable = isTimeRangeAvailable(
                updatedValues.durationFrom,
                e.target.value,
                busyTimes
            );

            if (!isAvailable) {
                ShowToaster('Selected time is completely busy. Please choose another slot.', 'warning');
                return;
            }
        }

        dispatch(setSlotFiledValues(updatedValues));
    };


    useEffect(() => {
        const selectedDate = slotDialog.slotField.meetingDate;
        if (!selectedDate) return;

        const selectedSlotsOfThisDate = MeetingSlots
            .filter(slot => {
                const a = new Date(slot.meetingDate!);
                const b = new Date(selectedDate);
                return (
                    a.getUTCFullYear() === b.getUTCFullYear() &&
                    a.getUTCMonth() === b.getUTCMonth() &&
                    a.getUTCDate() === b.getUTCDate()
                );
            }).map(slot => ({ from: slot.durationFrom, to: slot.durationTo }));

        setBusyTimes(selectedSlotsOfThisDate);

    }, [MeetingSlots, slotDialog.slotField.meetingDate]);


    return (
        <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Select Time</p>
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <label htmlFor="fromTime" className="text-xs font-medium text-gray-600 mb-1">From</label>
                    <Input
                        id="fromTime"
                        type="time"
                        value={slotDialog.slotField.durationFrom || ""}
                        readOnly={isReadOnly}
                        onChange={(e) => handleChange(e, "durationFrom")}
                        placeholder="HH:MM"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="toTime" className="text-xs font-medium text-gray-600 mb-1">To</label>
                    <Input
                        id="toTime"
                        type="time"
                        value={slotDialog.slotField.durationTo || ""}
                        readOnly={isReadOnly}
                        onChange={(e) => handleChange(e, "durationTo")}
                        placeholder="HH:MM"
                    />
                </div>
            </div>
        </div>
    )
}

export default TimePicker