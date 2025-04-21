'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ActivityType } from '@/types/client-types';
// import { sampleActivities } from '@/utils/client/data';
import { useAppSelector } from '@/lib/hooks';

const ActivityCard = ({ activity }: { activity: ActivityType }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{activity.title}</h3>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${activity.type === 'upcoming'
              ? 'bg-blue-100 text-blue-800'
              : activity.type === 'recent'
                ? 'bg-green-100 text-green-800'
                : 'bg-purple-100 text-purple-800'
              }`}
          >
            {activity.type}
          </span>
        </div>
        <p className="text-gray-500 mt-2">{activity.time}</p>
      </div>
    </motion.div>
  );
};

const ActivitySection = ({ title, activities }: { title: string; activities: ActivityType[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      <div
        ref={containerRef}
        className="relative min-h-[300px] max-h-[300px] overflow-y-scroll scroll-smooth space-y-4"
        style={{ perspective: 1200 }}
      >
        {activities.length > 0 ? (
          activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))
        ) : (
          <div className="text-gray-500 text-center text-sm py-12">
            No {title.toLowerCase()} available.
          </div>
        )}
      </div>
    </div>
  );
};

export default function Activities() {
  const { activities } = useAppSelector(state => state.userStore);

  const [Activities, setActivities] = useState<{
    upcomingMeetings: ActivityType[],
    recentActivities: ActivityType[],
    availableSlots: ActivityType[],
  }>({
    upcomingMeetings: [],
    recentActivities: [],
    availableSlots: [],
  });

  useEffect(() => {
    if (activities) {
      setActivities((prev) => ({
        ...prev,
        upcomingMeetings: activities?.filter((a) => a.type === 'upcoming') || [],
        recentActivities: activities?.filter((a) => a.type === 'recent') || [],
        availableSlots: activities?.filter((a) => a.type === 'available') || [],
      }));
    }
  }, [activities])


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {/* use Activities Object */}
      <ActivitySection title="Upcoming Meetings" activities={Activities.upcomingMeetings} />
      <ActivitySection title="Recent Activities" activities={Activities.recentActivities} />
      <ActivitySection title="Available Slots" activities={Activities.availableSlots} />
    </div>
  );
}
