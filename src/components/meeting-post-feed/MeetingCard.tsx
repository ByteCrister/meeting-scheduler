'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import LoadingSpinner from '../global-ui/ui-component/LoadingSpinner';
import { NewsFeedTypes } from '@/types/client-types';
import { useRouter } from 'next/navigation';
import { formatUTCDateToOffset } from '@/utils/client/date-convertions/formatUTCDateToOffset';
import { useAppSelector } from '@/lib/hooks';
import { getConvertedTime } from '@/utils/client/date-convertions/convertDateTime';

type PropTypes = {
    feed: NewsFeedTypes;
    handleBookSlot: (slotId: string) => Promise<void>;
    isExpand: boolean;
    meetingPost: string | null
};


const actualConvertedDurationTime = (meetingDate: string, durationTime: string, targetTimeZone: string, userTimeZone: string) => {
    const isSameTimeZone = targetTimeZone === userTimeZone;
    return isSameTimeZone ? durationTime : getConvertedTime(meetingDate, durationTime, userTimeZone);
};

const MeetingCard = ({ feed, handleBookSlot, isExpand, meetingPost }: PropTypes) => {
    const userTimeZone = useAppSelector(state => state.userStore.user?.timeZone);
    const [isExpanded, setIsExpanded] = useState(isExpand);
    const bookedCount = feed.bookedUsers.length;
    const router = useRouter();

    if (!feed || !feed.owner || !feed.title) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 text-center text-gray-500 italic">
                <p>This meeting post is unavailable or might have been removed.</p>
            </div>
        );
    };

    const handleProfileClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        router.push(`/searched-profile?user=${feed.owner.owner_id}`);
    }

    return (
        <motion.div
            layout
            className={`rounded-xl border transition-all overflow-hidden 
            ${feed._id === meetingPost
                    ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300 shadow-md scale-[1.005]'
                    : 'bg-white border-gray-200 hover:shadow-md shadow-sm'}
        `}
        >
            {/* Header */}
            <motion.div
                layout
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between px-4 py-3 cursor-pointer"
            >
                <div onClick={handleProfileClick} className="flex items-center gap-4 group">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                        <Image src={feed.owner.image} alt={feed.owner.username} fill className="object-cover" />
                    </div>
                    <div className="flex flex-col">
                        <div className="font-semibold text-gray-800 text-sm group-hover:underline">{feed.owner.username}</div>
                        <span className="text-sm text-gray-600 font-medium">{feed.title}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Calendar icon with date */}
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(
                            formatUTCDateToOffset(feed.meetingDate, userTimeZone!)
                        ), 'MMM d')}</span>
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
                                        {
                                            `${actualConvertedDurationTime(feed.meetingDate, feed.durationFrom, feed.owner.timeZone, userTimeZone!)} - 
                                            ${actualConvertedDurationTime(feed.meetingDate, feed.durationTo, feed.owner.timeZone, userTimeZone!)}
                                            `
                                        }
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