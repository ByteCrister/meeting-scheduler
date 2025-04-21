"use client";

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { setSlotFiledValues, toggleSlotDialog, toggleSlotDropDialog } from '@/lib/features/component-state/componentSlice';
import { useAppDispatch } from '@/lib/hooks';
import { registerSlot, RegisterSlotStatus } from '@/types/client-types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';
import { MoreVertical } from 'lucide-react';

const SlotOption = ({ slot }: { slot: registerSlot }) => {
    const dispatch = useAppDispatch();

    const handleBtnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const { id } = e.currentTarget;
        if (id !== 'drop') {
            dispatch(setSlotFiledValues(slot));
            dispatch(toggleSlotDialog({ isOpen: true, mode: id as ('view' | 'update') }));
        } else {
            dispatch(toggleSlotDropDialog({ isOpen: true, slotTitle: slot.title, slotId: slot._id }));
        }
    };

    const EditSlotBtn = ({ slot }: { slot: registerSlot }) => {
        const isDisabled = slot.status !== RegisterSlotStatus.Upcoming;

        const tooltipText = isDisabled
            ? "Editing is only available before the session starts."
            : "Click to edit this slot.";

        return (
            <TooltipProvider>
                <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                        <button
                            id="update"
                            disabled={isDisabled}
                            onClick={handleBtnClick}
                            className={`block w-full text-left px-4 py-2 text-sm ${isDisabled
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-100 cursor-pointer'
                                }`}
                        >
                            Edit
                        </button>
                    </TooltipTrigger>
                    <TooltipContent
                        side="right"
                        className="z-50 max-w-xs text-xs text-left leading-tight bg-white text-gray-800 p-2 rounded shadow"
                    >
                        <p>{tooltipText}</p>
                    </TooltipContent>

                </Tooltip>
            </TooltipProvider>
        );
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                >
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="bg-white rounded-md shadow-lg w-48 z-30 p-1">
                <button
                    id="view"
                    onClick={handleBtnClick}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                    View
                </button>
                <EditSlotBtn slot={slot} />
                <button
                    id="drop"
                    onClick={handleBtnClick}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                    Delete
                </button>
            </PopoverContent>

        </Popover>
    )
}

export default SlotOption;