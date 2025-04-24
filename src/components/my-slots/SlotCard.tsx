import { registerSlot, RegisterSlotStatus } from "@/types/client-types";
import { motion } from 'framer-motion';
import { Calendar, Tag, Users } from "lucide-react";
import SlotOption from "./SlotOption";

const statusColors: Record<RegisterSlotStatus, string> = {
    [RegisterSlotStatus.Upcoming]: 'bg-green-100 text-green-800',
    [RegisterSlotStatus.Ongoing]: 'bg-yellow-100 text-yellow-800',
    [RegisterSlotStatus.Completed]: 'bg-gray-100 text-gray-800',
    [RegisterSlotStatus.Expired]: 'bg-red-200 text-gray-700',
};

export const formateSlotMeetingDate = (dateString?: string) => {
    if (!dateString) return "Invalid date";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};


export const formatDateStringToDateYear = (dateString?: string) => {
    if (!dateString) return "Invalid date"; // return a placeholder if the date is invalid
    const date = new Date(dateString);

    const options: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "short",  // "short" for abbreviated month (e.g., "Mar")
        year: "numeric"
    };

    return date.toLocaleDateString("en-GB", options); // en-GB for day month year format
};


import { Sparkles } from "lucide-react";

const SlotCard = ({ slot, isSearchedSlot }: { slot: registerSlot, isSearchedSlot: boolean }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative rounded-xl transition-all duration-300 overflow-hidden
                ${isSearchedSlot 
                    ? 'bg-white/70 backdrop-blur-md shadow-lg ring-2 ring-offset-2 ring-blue-400/60 animate-pulse-slow'
                    : 'bg-white shadow-sm hover:shadow-md'}
            `}
        >
            {/* "Matched" Badge */}
            {isSearchedSlot && (
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-blue-900 text-white text-[11px] px-2 py-0.5 rounded-full shadow-md z-10">
                    <Sparkles className="w-3 h-3" />
                    Matched Result
                </div>
            )}

            <div className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {slot.title}
                                <span className="text-sm text-gray-400 align-baseline ml-1">
                                    <sub>{formatDateStringToDateYear(slot.createdAt!)}</sub>
                                </span>
                            </h3>
                            <SlotOption slot={slot} />
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3">
                            <div className="flex items-center text-sm text-gray-500">
                                <Tag className="w-4 h-4 mr-1" />
                                {slot.category}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                                <Users className="w-4 h-4 mr-1" />
                                {slot.bookedUsers.length} bookings
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formateSlotMeetingDate(slot.meetingDate)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[slot.status]}`}>
                        {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};


export default SlotCard;