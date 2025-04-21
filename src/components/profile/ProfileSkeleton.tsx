'use client';

import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileSkeleton() {
    return (
        <div className="max-w-4xl mx-auto p-6 animate-pulse">
            <div className="bg-gray-50 rounded-2xl shadow-lg p-8 border border-gray-200">
                {/* Profile Image Skeleton */}
                <div className="flex justify-center mb-8">
                    <Skeleton className="w-32 h-32 rounded-full bg-gray-200" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Editable Fields Skeleton */}
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-1/4 bg-gray-200" />
                                <Skeleton className="h-10 w-full rounded-md bg-gray-200" />
                            </div>
                        ))}
                    </div>

                    {/* Stat Cards Skeleton */}
                    <div className="grid grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 flex flex-col items-center gap-3"
                            >
                                <Skeleton className="w-10 h-10 rounded-full bg-gray-200" />
                                <Skeleton className="h-6 w-16 bg-gray-200" />
                                <Skeleton className="h-4 w-20 bg-gray-200" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
