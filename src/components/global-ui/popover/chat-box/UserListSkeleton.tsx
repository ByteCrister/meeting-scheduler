'use client';

import { Skeleton } from "@/components/ui/skeleton";

export default function UserListSkeleton() {
    return (
        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-md">
                    <div className="flex items-center space-x-3">
                        <Skeleton className="w-8 h-8 bg-neutral-300 rounded-full" />
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-64 bg-neutral-200 rounded" />
                            <Skeleton className="h-3 w-72 bg-neutral-200 rounded" />
                        </div>
                    </div>
                </div>
            ))}

            <Skeleton className="mt-2 h-9 w-full bg-neutral-300 rounded-md" />
        </div>
    );
}