import React from 'react'
import { Skeleton } from '../ui/skeleton'

const CardSkeleton = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
                <Skeleton className="h-4 w-16" />
            </div>

            {/* Content */}
            <div className="border-t border-gray-100 px-4 py-4 space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />

                <div className="flex gap-2 flex-wrap">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                    <Skeleton className="h-12 rounded-lg" />
                    <Skeleton className="h-12 rounded-lg" />
                </div>

                <Skeleton className="h-10 w-full rounded-lg mt-2" />
            </div>
        </div>
    )
}

const MeetingCardSkeleton = () => {
    return (
        <div className="space-y-4">
            {[...Array(2)].map((_, idx) => (
                <CardSkeleton key={idx} />
            ))}
        </div>
    )
}

export default MeetingCardSkeleton