import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from 'framer-motion';

export const MeetingSlotCardSkeleton = () => {
    return (
        Array.from({ length: 3 }).map((_, index) => (
            <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
            >
                <Card className="p-6 rounded-3xl border border-muted bg-gradient-to-br from-background via-background/90 to-background/80 shadow-[0_8px_24px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-shadow duration-300 mt-2.5">
                    <div className="space-y-5">
                        {/* Title & Badge */}
                        <div className="flex justify-between items-start">
                            <Skeleton className="h-6 w-1/3 bg-neutral-300 rounded-md" />
                            <Skeleton className="h-5 w-20 bg-neutral-200 rounded-md" />
                        </div>

                        {/* Description */}
                        <Skeleton className="h-4 w-3/4 bg-neutral-300 rounded-md" />

                        {/* Info Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                                <Skeleton className="h-4 w-16 bg-neutral-200 rounded-md" />
                            </div>
                            <div className="flex items-center">
                                <Skeleton className="h-4 w-24 bg-neutral-200 rounded-md" />
                            </div>
                            <div className="flex items-center">
                                <Skeleton className="h-4 w-20 bg-neutral-200 rounded-md" />
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className="pt-1">
                            <Skeleton className="h-10 w-full bg-gray-700 rounded-xl" />
                        </div>
                    </div>
                </Card>


            </motion.div>
        ))
    )
};