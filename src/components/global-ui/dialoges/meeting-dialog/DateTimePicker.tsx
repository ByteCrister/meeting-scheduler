"use client";

import { Calendar } from "@/components/ui/calendar";
import { setSlotFiledValues } from "@/lib/features/component-state/componentSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import React, { useEffect, useState } from "react";
import _ from "lodash";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { MdPushPin } from "react-icons/md";
import TimePicker from "./TimePicker";

const DateTimePicker = () => {
    const { slotField, mode } = useAppSelector(
        (state) => state.componentStore.slotDialog
    );
    const { Store } = useAppSelector((state) => state.slotStore);
    const [meetingDates, setMeetingDates] = useState<{
        [key: string]: { date: boolean; times: { from: string; to: string }[] };
    }>({});

    const { meetingDate } = slotField;
    const dispatch = useAppDispatch();
    const isReadOnly = mode === "view";

    const [isCalendarOpen, setIsCalendarOpen] = useState(false);


    useEffect(() => {
        if (Store && Store.length !== 0) {
            const groupedByDate = _.groupBy(Store, (slot) => {
                const date = new Date(slot.meetingDate as string);
                return date.toISOString().split("T")[0];
            });
            const dateMap = _.mapValues(groupedByDate, (slots) => ({
                date: true,
                times: slots.map((slot) => ({
                    from: slot.durationFrom,
                    to: slot.durationTo,
                })),
            }));
            setMeetingDates(dateMap);
        }
    }, [Store]);

    const handleDateChange = (selectedDate: Date | undefined) => {
        const updatedValues = {
            ...slotField,
            meetingDate: selectedDate?.toISOString(),
        };
        dispatch(setSlotFiledValues(updatedValues));
        setIsCalendarOpen(false);
    };

    // Custom render for day content with pin icon and time duration tooltip
    const renderDay = (date: Date) => {
        const isoDate = date.toISOString().split("T")[0];
        const selectedDate = meetingDate ? new Date(meetingDate) : null;
        const selectedIso = selectedDate?.toISOString().split("T")[0];

        const key = new Date(date).toISOString().split("T")[0];
        const hasData = meetingDates[key];

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isDisabled = date < today || isReadOnly;
        const isSelected = isoDate === selectedIso;

        const handleClick = () => {
            if (!isDisabled) {
                handleDateChange(date);
            }
        };

        return (
            <TooltipProvider key={isoDate}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div
                            onClick={handleClick}
                            className={`
                                relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-md transition-colors
                                ${isDisabled
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "cursor-pointer"
                                }
                                ${isSelected
                                    ? "bg-gray-900 text-white"
                                    : "hover:bg-gray-100"
                                }
                            `}
                        >
                            <span className="text-sm font-medium">{date.getDate()}</span>

                            {hasData && !isDisabled && (
                                <>
                                    <MdPushPin className="absolute top-1 right-1 text-xl text-red-500 rotate-12" />
                                    {hasData.times.length > 1 && (
                                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full px-1 leading-none">
                                            {hasData.times.length}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    </TooltipTrigger>
                    {hasData && !isDisabled && (
                        <TooltipContent className="bg-white text-black shadow-lg rounded-md p-2 text-xs max-w-[180px] w-full z-50">
                            <ul className="space-y-1">
                                {hasData.times.map((t, idx) => (
                                    <li key={idx}>
                                        {t.from} - {t.to}
                                    </li>
                                ))}
                            </ul>
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
        );
    };

    return (
        <div className="w-full px-4 sm:px-6">
            <div className="w-full max-w-md mx-auto space-y-4">
                <p className="text-sm font-medium text-gray-700">Select a Date</p>

                {!isCalendarOpen ? (
                    <input
                        type="text"
                        readOnly
                        value={meetingDate ? new Date(meetingDate).toDateString() : ""}
                        onClick={() => !isReadOnly && setIsCalendarOpen(true)}
                        className="border rounded-lg p-3 w-full cursor-pointer bg-white shadow text-gray-600"
                        placeholder="Choose a date"
                    />
                ) : (
                    <div className="border rounded-lg p-4 shadow bg-white overflow-x-auto">
                        <Calendar
                            mode="single"
                            selected={meetingDate ? new Date(meetingDate) : undefined}
                            initialFocus
                            disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return date < today || isReadOnly;
                            }}
                            onSelect={handleDateChange}
                            modifiersClassNames={{}}
                            components={{
                                Day: ({ date }) => renderDay(date),
                                Head: () => {
                                    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                                    return (
                                        <thead>
                                            <tr className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground mb-2">
                                                {days.map((day) => (
                                                    <th key={day} className="py-2 text-center text-sm font-semibold text-gray-600">
                                                        {day}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                    );
                                }
                            }}
                        />
                    </div>
                )}
            </div>

            <div className="mt-6">
                <TimePicker />
            </div>
        </div>
    );
};

export default DateTimePicker;
