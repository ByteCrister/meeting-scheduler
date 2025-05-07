"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import apiService from "@/utils/client/api/api-services";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";

type ClusteredSlot = {
    _id: string;
    title: string;
    category: string;
    cluster: number;
    sentiment?: number;
};

const clusterColors = [
    "from-purple-500 to-indigo-500",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-rose-500 to-pink-500"
];

export default function TrendingTopicsCluster() {
    const [data, setData] = useState<ClusteredSlot[]>([]);
    const [grouped, setGrouped] = useState<Record<number, ClusteredSlot[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const resData = await apiService.get(`/api/ai-insights/trending`);
                if (resData.success) {
                    setData(resData.data);
                } else {
                    throw new Error(resData.message || 'Failed to fetch trending topics');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unexpected error occurred');
                console.error('Error fetching trending topics:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        try {
            const map: Record<number, ClusteredSlot[]> = {};
            data.forEach(slot => {
                if (!map[slot.cluster]) map[slot.cluster] = [];
                map[slot.cluster].push(slot);
            });
            setGrouped(map);
        } catch (err) {
            console.error('Error processing cluster data:', err);
            setError('Error processing cluster data');
        }
    }, [data]);

    if (loading) {
        return (
            <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-32 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="w-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    if (data.length === 0) {
        return (
            <Card className="w-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                <CardHeader>
                    <CardTitle>No Trending Topics</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>No data available to display trending topics.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Image src='/images/trend.png' width={30} height={30} alt="world-image" />
                    <span className="text-gray-700 text-xl">Trending Meeting Categories</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {Object.entries(grouped).map(([clusterId, slots], index) => (
                        <motion.div
                            key={`cluster-${clusterId}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-800"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`h-8 w-8 rounded-full bg-gradient-to-r ${clusterColors[parseInt(clusterId) % clusterColors.length]} flex items-center justify-center text-white font-bold`}>
                                    {clusterId}
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                    Topic Cluster {clusterId}
                                </h3>
                            </div>
                            <ul className="space-y-3">
                                {slots.slice(0, 3).map((slot, index) => (
                                    <motion.li
                                        key={slot._id + index}
                                        whileHover={{ scale: 1.02 }}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-200"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                {slot.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800">
                                                    {slot.category}
                                                </Badge>
                                                {slot.sentiment !== undefined && (
                                                    <Badge
                                                        variant="secondary"
                                                        className={`${slot.sentiment > 0
                                                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                                            }`}
                                                    >
                                                        {slot.sentiment > 0 ? "↑ Positive" : "↓ Negative"}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
