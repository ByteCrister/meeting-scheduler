import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const ListSkeleton = () => {
    return (
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                    <Card className="p-4 flex flex-row items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <div className="flex items-center space-x-4">
                            {/* Skeleton for Avatar */}
                            <Skeleton className="h-12 w-12 bg-neutral-300 rounded-full" />

                            <div className="space-y-2">
                                {/* Skeleton for Username */}
                                <Skeleton className="h-4 w-32 bg-neutral-200 rounded-md" />

                                {/* Skeleton for Title */}
                                <Skeleton className="h-4 w-24 bg-neutral-200 rounded-md" />
                            </div>
                        </div>

                        {/* Skeleton for Button */}
                        <div className="mt-4 w-24">
                            <Skeleton className="h-8 w-full bg-neutral-300 rounded-lg" />
                        </div>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}

export default ListSkeleton