'use client';

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Meeting } from './MeetingCard';
type PropTypes = { meeting: Meeting };

const ViewDetails = ({ meeting }: PropTypes) => {
    const [currentPart, setCurrentPart] = useState(1);
    const handleNext = () => {
        if (currentPart < 3) setCurrentPart(currentPart + 1);
    };

    const handlePrev = () => {
        if (currentPart > 1) setCurrentPart(currentPart - 1);
    };
    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="flex justify-center pt-3 mt-auto">
                    <button id='view-details' className="text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 rounded-lg py-2 px-6 sm:px-8 md:px-10 lg:px-12 w-full sm:w-auto transition-all duration-300 cursor-pointer">
                        View Details
                    </button>
                </div>
            </DialogTrigger>

            <DialogContent className="max-w-xl w-full p-4 sm:p-6 space-y-4 rounded-2xl shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                        Meeting Slot Details
                    </DialogTitle>
                </DialogHeader>

                {/* Step 1 */}
                {currentPart === 1 && (
                    <div className="space-y-3">
                        <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 text-xs font-medium rounded-full shadow-sm">
                            {meeting.category}
                        </span>
                        <h4 className="text-xl font-semibold text-gray-800">{meeting.title}</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">{meeting.description}</p>
                    </div>
                )}

                {/* Step 2 */}
                {currentPart === 2 && (
                    <div className="text-sm text-gray-700">
                        <p>
                            <span className="font-medium">Meeting Date & Time:</span>{' '}
                            {new Date(meeting.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                            })}{' '}
                            • Duration: {meeting.duration}
                        </p>
                    </div>
                )}

                {/* Step 3 */}
                {currentPart === 3 && (
                    <div className="space-y-2 text-sm text-gray-700">
                        <p>
                            <span className="font-medium">Tags:</span> {meeting.tags.join(', ')}
                        </p>
                        <p>
                            <span className="font-medium">Guest Size:</span> {meeting.guestSize} guests
                        </p>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <button
                        id='view-detail-previous'
                        onClick={handlePrev}
                        disabled={currentPart === 1}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 
    shadow-sm border border-gray-300 
    ${currentPart === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200 shadow-none'
                                : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md hover:border-gray-400'
                            }`}
                    >
                        ⬅ Prev
                    </button>


                    <div className="flex gap-2">
                        <button
                            id='next-btn'
                            onClick={handleNext}
                            disabled={currentPart === 3}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentPart === 3
                                ? 'bg-blue-200 text-white cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            Next
                        </button>

                        <DialogTrigger asChild>
                            <button id='view-detail-close' className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
                                Close
                            </button>
                        </DialogTrigger>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ViewDetails