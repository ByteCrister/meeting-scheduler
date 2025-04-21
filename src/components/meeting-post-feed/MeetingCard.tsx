'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import LoadingSpinner from '../global-ui/ui-component/LoadingSpinner';
import { NewsFeedTypes } from '@/types/client-types';

type PropTypes = {
    feed: NewsFeedTypes;
    handleBookSlot: (slotId: string) => Promise<void>;
}

const MeetingCard = ({ feed, handleBookSlot }: PropTypes) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const bookedCount = feed.bookedUsers.length;

    return (
        <motion.div
            layout
            className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all overflow-hidden"
        >
            {/* Header */}
            <motion.div
                layout
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between px-4 py-3 cursor-pointer"
            >
                <div className="flex items-center gap-4">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                        <Image src={feed.owner.image} alt={feed.owner.username} fill className="object-cover" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-800 text-sm">{feed.owner.username}</span>
                        <span className="text-sm text-gray-600 font-medium">{feed.title}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Calendar icon with date */}
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(feed.meetingDate), 'MMM d')}</span>
                    </div>
                    {/* Chevron */}
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-gray-500"
                    >
                        <ChevronDown className="w-5 h-5" />
                    </motion.div>
                </div>
            </motion.div>

            {/* Expandable Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-100 px-4 py-4"
                    >
                        <div className="space-y-4">
                            {/* Description */}
                            <p className="text-sm text-gray-600">{feed.description}</p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                                {feed.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-full font-medium"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Meeting Details */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-gray-500">Time</p>
                                    <p className="text-gray-800 font-medium">
                                        {feed.durationFrom} - {feed.durationTo}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-gray-500">Guests</p>
                                    <p className="text-gray-800 font-medium">
                                        {bookedCount}/{feed.guestSize} booked
                                    </p>
                                </div>
                            </div>

                            {/* Book Button */}
                            {
                                feed.isBooking
                                    ? <LoadingSpinner />
                                    : <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => handleBookSlot(feed._id)}
                                        className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition cursor-pointer"
                                    >
                                        Book Meeting
                                    </motion.button>
                            }

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default MeetingCard;