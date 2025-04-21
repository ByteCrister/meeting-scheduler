'use client';

import { Skeleton } from "@/components/ui/skeleton";

export default function BookedMeetingsSkeleton() {
    return (
        <div className="max-w-4xl mx-auto p-6 min-h-screen">
            {/* Page Heading */}
            <div className="mb-8 space-y-2">
                <Skeleton className="h-8 w-1/3 bg-neutral-300" />
                <Skeleton className="h-5 w-1/2 bg-neutral-300" />
            </div>

            {/* Search and Sort Section */}
            <div className="mb-6 flex items-center justify-between gap-2">
                {/* Search bar skeleton */}
                <Skeleton className="h-10 w-[60%] rounded-xl bg-neutral-300" />

                {/* Sort button skeleton */}
                <Skeleton className="h-10 w-36 rounded-lg bg-neutral-300" />
            </div>

            {/* Meetings List Skeletons */}
            <div className="space-y-6">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-xl shadow-sm p-6 space-y-4"
                    >
                        <Skeleton className="h-5 w-24 rounded-full bg-neutral-200" />
                        <Skeleton className="h-6 w-1/2 bg-neutral-200" />

                        <div className="space-y-2">
                            <Skeleton className="h-4 w-1/3 bg-neutral-200" />
                            <Skeleton className="h-4 w-1/3 bg-neutral-200" />
                            <Skeleton className="h-4 w-1/4 bg-neutral-200" />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <Skeleton className="h-8 w-20 rounded-lg bg-neutral-200" />
                            <Skeleton className="h-8 w-20 rounded-lg bg-neutral-200" />
                            <Skeleton className="h-8 w-20 rounded-lg bg-neutral-200" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
