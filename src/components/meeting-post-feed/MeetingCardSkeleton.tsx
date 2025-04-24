import React from 'react'
import { Skeleton } from '../ui/skeleton'

const CardSkeleton = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-full bg-neutral-300" />
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-24 bg-neutral-200" />
                        <Skeleton className="h-3 w-32 bg-neutral-200" />
                    </div>
                </div>
                <Skeleton className="h-4 w-16 bg-neutral-300" />
            </div>

            {/* Content */}
            <div className="border-t border-gray-100 px-4 py-4 space-y-4">
                <Skeleton className="h-4 w-full bg-neutral-200" />
                <Skeleton className="h-4 w-5/6 bg-neutral-200" />

                <div className="flex gap-2 flex-wrap">
                    <Skeleton className="h-5 w-16 rounded-full bg-neutral-300" />
                    <Skeleton className="h-5 w-12 rounded-full bg-neutral-200" />
                    <Skeleton className="h-5 w-14 rounded-full bg-neutral-300" />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                    <Skeleton className="h-12 rounded-lg bg-neutral-200" />
                    <Skeleton className="h-12 rounded-lg bg-neutral-200" />
                </div>

                <Skeleton className="h-10 w-full rounded-lg mt-2 bg-neutral-300" />
            </div>
        </div>
    )
}

const MeetingCardSkeleton = () => {
    return (
        <div className="space-y-4 mt-2.5">
            {[...Array(1)].map((_, idx) => (
                <CardSkeleton key={idx} />
            ))}
        </div>
    )
}

export default MeetingCardSkeleton