"use client";

import { Suspense } from "react";
import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { motion } from "framer-motion";
import { ErrorBoundary } from 'react-error-boundary';
import TrendingKeywordsChart from "./TrendingKeywordsChart";
import ErrorFallback from "./ErrorBoundary";
import TrendingTopicsCluster from "./TrendingTopicsCluster";
import BestMeetingTimesChart from "./BestMeetingTimesChart";

function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                    <Skeleton className="h-8 w-3/4 mb-4" />
                    <Skeleton className="h-32 w-full" />
                </Card>
            ))}
        </div>
    );
}

const ErrorBoundaryWrapper = ({ children }: { children: React.ReactNode }) => (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
        {children}
    </ErrorBoundary>
);

export default function Trending() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 p-6"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Meeting Insights
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Real-time analysis of your meeting patterns and trends
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    Live Updates
                </div>
            </div>

            <Suspense fallback={<LoadingSkeleton />}>
                <div className="grid grid-cols-1 gap-6">
                    <ErrorBoundaryWrapper>
                        <TrendingKeywordsChart />
                    </ErrorBoundaryWrapper>
                    <ErrorBoundaryWrapper>
                        <TrendingTopicsCluster />
                    </ErrorBoundaryWrapper>
                    <ErrorBoundaryWrapper>
                        <BestMeetingTimesChart />
                    </ErrorBoundaryWrapper>
                </div>
            </Suspense>
        </motion.div>
    );
}
