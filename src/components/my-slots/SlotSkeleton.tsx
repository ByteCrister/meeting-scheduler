import { Skeleton } from "../ui/skeleton";

const SlotSkeleton = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6 w-full mt-2">
            <div className="flex items-start justify-between">
                <div className="flex-1 w-full">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-1/3 bg-neutral-300" />
                        <Skeleton className="h-8 w-8 bg-neutral-300 rounded-full" />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                        <Skeleton className="h-4 w-24 bg-neutral-300" />
                        <Skeleton className="h-4 w-28 bg-neutral-300" />
                        <Skeleton className="h-4 w-32 bg-neutral-300" />
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <Skeleton className="h-5 w-20 bg-neutral-300 rounded-full" />
            </div>
        </div>
    )
}

const SlotCardSkeleton = () => {
    return (
        Array.from({ length: 3 }).map((_, index) => {
            return <SlotSkeleton key={index} />
        })
    );
};


export default SlotCardSkeleton;