'use client';

import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export const MeetingCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <Skeleton className="h-48 w-full" />
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>

        <Skeleton className="h-6 w-3/4 mb-2" />
        
        <div className="space-y-3">
          <div className="flex items-center">
            <Skeleton className="h-5 w-5 mr-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          
          <div className="flex items-center">
            <Skeleton className="h-5 w-5 mr-2" />
            <Skeleton className="h-4 w-40" />
          </div>
          
          <div className="flex items-center">
            <Skeleton className="h-5 w-5 mr-2" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 flex-1 rounded-lg" />
        </div>
      </div>
    </div>
  );
}; 