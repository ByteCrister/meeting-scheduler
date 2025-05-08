'use client';

import { Skeleton } from "@/components/ui/skeleton";

export default function ChatBoxSkeleton() {
    return (
        <div className="flex flex-col w-full max-h-[400px] overflow-hidden bg-white">
            {/* Skeleton messages */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                <Skeleton className="h-6 w-3/4 bg-neutral-300 rounded-md" />
                <div className="flex justify-end">
                    <Skeleton className="h-6 w-2/3 bg-neutral-200 rounded-md" />
                </div>
                <div className="flex justify-end">
                    <Skeleton className="h-6 w-2/3 bg-neutral-200 rounded-md" />
                </div>
                <Skeleton className="h-6 w-1/2 bg-neutral-300 rounded-md" />
                <div className="flex justify-end">
                    <Skeleton className="h-6 w-1/3 bg-neutral-200 rounded-md" />
                </div>
                <Skeleton className="h-6 w-3/4 bg-neutral-300 rounded-md" />
                <div className="flex justify-end">
                    <Skeleton className="h-6 w-2/3 bg-neutral-200 rounded-md" />
                </div>
            </div>

            {/* Skeleton input area */}
            <div className="flex items-center gap-2 mt-2 pt-2 border-t px-2 pb-2">
                <Skeleton className="h-10 w-full bg-neutral-200 rounded-md" />
                <Skeleton className="h-10 w-10 bg-neutral-200 rounded-md" />
            </div>
        </div>
    );
}
