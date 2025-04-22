'use client';

import React, { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Users, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface BookedMeeting {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  duration: string;
  participants: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  createdAt: string;
}

interface BookedMeetingsProps {
  userId: string;
}


export const BookedMeetingCardSkeleton = () => {
  return (
    Array.from({ length: 3 }).map((_, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <Card className="p-6 rounded-3xl border border-muted bg-gradient-to-br from-background via-background/90 to-background/80 shadow-[0_8px_24px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-shadow duration-300">
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

export const BookedMeetings: React.FC<BookedMeetingsProps> = ({ userId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [meetings, setMeetings] = useState<BookedMeeting[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');


  useEffect(() => {
    const timer = setTimeout(() => {
      setMeetings([
        {
          id: '1',
          title: 'Product Strategy Discussion',
          description: 'Discuss strategic plans for Q2 launch and roadmap alignment.',
          date: '2024-03-25',
          time: '10:00 AM',
          duration: '30 min',
          participants: 5,
          status: 'upcoming',
          createdAt: '2024-03-20T09:00:00Z'
        },
        {
          id: '2',
          title: 'Technical Consultation',
          description: 'Code review and technical direction for frontend stack.',
          date: '2024-03-26',
          time: '02:00 PM',
          duration: '45 min',
          participants: 3,
          status: 'completed',
          createdAt: '2024-03-18T15:30:00Z'
        }
      ]);

      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [userId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return (
          <Badge className="bg-blue-100 text-blue-700 border border-blue-300 shadow-sm">
            Upcoming
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-700 border border-green-300 shadow-sm">
            Completed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-red-100 text-red-700 border border-red-300 shadow-sm">
            Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  const toggleSort = () => {
    const nextOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(nextOrder);

    setMeetings((prev) => {
      return [...prev].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return nextOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    });
  };

  if (isLoading) return <BookedMeetingCardSkeleton />;


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold tracking-tight">Booked Meetings</h2>
        <Button
          onClick={toggleSort}
          variant="ghost"
          className={`
    group
    relative
    flex items-center gap-1 text-sm font-medium
    text-gray-500 dark:text-gray-400
    hover:text-primary transition-colors duration-300
    px-3 py-1.5 rounded-lg
    border border-transparent hover:border-gray-300 dark:hover:border-gray-600
    shadow-sm hover:shadow-md
    bg-transparent hover:bg-gray-100/60 dark:hover:bg-gray-800/50
    backdrop-blur-sm
  `}
        >
          <span className="relative z-10">Created At</span>
          <motion.div
            key={sortOrder}
            initial={{ y: -4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {sortOrder === 'asc' ? (
              <ChevronUp className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors" />
            )}
          </motion.div>
        </Button>
      </div>

      {
        meetings.map((meeting, index) => (
          <motion.div
            key={meeting.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="p-6 rounded-3xl border border-muted bg-gradient-to-br from-background via-background/90 to-background/80 shadow-[0_8px_24px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-shadow duration-300">
              <div className="space-y-5">
                {/* Title & Badge */}
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-foreground">{meeting.title}</h3>
                  {getStatusBadge(meeting.status)}
                </div>

                {/* Description */}
                {meeting.description && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {meeting.description}
                  </p>
                )}

                {/* Info Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-primary" />
                    <span>
                      {new Date(meeting.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-primary" />
                    <span>{meeting.time} ({meeting.duration})</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-primary" />
                    <span>{meeting.participants} participants</span>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-1">
                  <Button
                    variant="default"
                    className="w-full bg-gray-700 rounded-xl text-base font-medium flex items-center justify-center gap-2 group hover:bg-gray-800 transition-all"
                  >
                    <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    Book Meeting
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))
      }
    </div>
  );
};
