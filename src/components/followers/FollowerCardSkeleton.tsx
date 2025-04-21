const Skeleton = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-neutral-300 rounded-full" />
                    <div className="space-y-2">
                        <div className="w-32 h-4 bg-neutral-300 rounded" />
                        <div className="w-24 h-3 bg-neutral-300 rounded" />
                    </div>
                </div>
                <div className="w-8 h-8 bg-neutral-300 rounded-full" />
            </div>
        </div>
    )
};

const FollowerCardSkeleton = () => {
    return (
        <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} />
            ))
            }
        </div>

    )
}

export default FollowerCardSkeleton