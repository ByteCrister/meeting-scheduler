'use client';

import { BookedSlotsTypes } from '@/types/client-types';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Eye, Trash2 } from 'lucide-react';
import { formateSlotMeetingDate } from '../my-slots/SlotCard';
import { useAppDispatch } from '@/lib/hooks';
import { useCallback } from 'react';
import { toggleDeleteBookedSlotAlert, toggleViewBookedSlot } from '@/lib/features/component-state/componentSlice';
import JoinMeeting from './JoinMeeting';
import { getDuration } from '@/utils/client/date-convertions/getDuration';

const statusColors = {
    upcoming: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    // cancelled: 'bg-red-100 text-red-800',
};


const MeetingCard = ({ meeting }: { meeting: BookedSlotsTypes }) => {
    const dispatch = useAppDispatch();

    const isJoinEnabled = meeting.status === 'ongoing';

    const handleViewClick = useCallback(() => {
        dispatch(toggleViewBookedSlot({ isOpen: true, Slot: meeting }));
    }, [dispatch, meeting]);

    const handleDeleteClick = useCallback(() => {
        dispatch(toggleDeleteBookedSlotAlert({ isOpen: true, slotId: meeting._id }));
    }, [dispatch, meeting._id]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
        >
            <div className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[meeting.status as 'upcoming' | 'ongoing' | 'completed']}`}>
                                {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                            </span>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{meeting.title}</h3>

                        <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                                <User className="w-4 h-4 mr-2 text-gray-400" />
                                {meeting.creator}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                {formateSlotMeetingDate(meeting.meetingDate || '')}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                {getDuration(meeting.durationFrom, meeting.durationTo)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-2">
                    <button
                        id='booked-meeting-view'
                        onClick={handleViewClick}
                        className="w-full sm:w-auto flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                    </button>
                    <button
                        id='booked-meeting-delete'
                        onClick={handleDeleteClick}
                        className="w-full sm:w-auto flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </button>
                    <JoinMeeting isJoinEnabled={isJoinEnabled} />
                </div>

            </div>
        </motion.div>
    );
};

export default MeetingCard;