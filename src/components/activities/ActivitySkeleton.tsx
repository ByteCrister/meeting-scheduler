'use client';

import { Skeleton } from "@/components/ui/skeleton";

export default function ActivitySkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 animate-pulse">
            {[...Array(3)].map((_, sectionIdx) => (
                <div
                    key={sectionIdx}
                    className="bg-gray-50 rounded-xl shadow-lg p-6 border border-gray-200"
                >
                    {/* Section Title */}
                    <Skeleton className="h-6 w-1/2 mb-6 bg-gray-200" />

                    {/* Cards */}
                    <div className="space-y-6">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="rounded-lg p-4 border border-gray-300 bg-white space-y-3 shadow-sm"
                            >
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-5 w-2/3 bg-gray-200" />
                                    <Skeleton className="h-5 w-16 rounded-full bg-gray-200" />
                                </div>
                                <Skeleton className="h-4 w-1/3 bg-gray-200" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
