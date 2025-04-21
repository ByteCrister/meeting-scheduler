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


const SlotCard = ({ slot }: { slot: registerSlot }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
        >
            <div className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {slot.title}
                                {/* Show the createdAt in subscript style if available */}
                                <span className="text-sm text-gray-400 align-baseline ml-1">
                                    <sub>{formatDateStringToDateYear(slot.createdAt!)}</sub>
                                </span>
                            </h3>
                            {/* Slot option */}
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