'use client';

import React, { useState, useEffect } from 'react';
import { MeetingSlots } from '../meetings/MeetingSlots';
import { motion } from "framer-motion";
import { Calendar, Users, UserCheck } from "lucide-react";
import { NumberTicker } from '../../magicui/number-ticker';
import { getSearchedUser } from '@/utils/client/api/api-searched-profile';
import { ApiSPType } from '@/utils/constants';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchedProfileSkeleton from './SearchedProfileSkeleton';
import { useAppSelector } from '@/lib/hooks';
import { ProfileHeader } from '../profile-header/ProfileHeader';
import { FriendList } from '../friend-list/FriendList';

export interface SearchedUserProfile {
  _id: string;
  username: string;
  title: string;
  profession: string;
  timezone: string;
  image: string;
  followers: number;
  following: number;
  meetingSlots: number;
}

const tabs = [
  { value: "meetings", label: "Meetings", icon: Calendar },
  { value: "followers", label: "Followers", icon: Users },
  { value: "following", label: "Following", icon: UserCheck },
];


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const initialCount = {
  followers: 0,
  following: 0,
  meetings: 0,
};

type CountState = typeof initialCount;

export const SearchedProfile: React.FC = () => {
  const currentUserId = useAppSelector(state => state.userStore.user?._id);

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<SearchedUserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('meetings');
  const [count, setCount] = useState<CountState>({
    followers: 0,
    following: 0,
    meetings: 0
  });
  const searchParams = useSearchParams()
  const userId = searchParams?.get('user') || '';
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // const userId='6804a796916f0077ddcd21fa';
      const response = await getSearchedUser(userId || '', ApiSPType.GET_USER);
      const { data, success } = response.data as { data: SearchedUserProfile, success: boolean };
      if (success) {
        // if (currentUserId === data._id) router.push('/');
        setProfile(data);
        setCount({ followers: data.followers, following: data.following, meetings: data.meetingSlots });
      }
      setIsLoading(false);
    };

    fetchData();
  }, [currentUserId, router, userId]);

  if (isLoading) return <SearchedProfileSkeleton />;

  if (!profile) return <div className='min-h-screen flex items-center justify-center'>User profile not found!</div>;

  return (
    <div className="min-h-screen w-full px-4 py-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <ProfileHeader profile={profile} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-12"
      >
        <div className="flex flex-wrap md:flex-row gap-2 pb-2 border-b border-muted mb-6 transition-all duration-150 ease-in-out">
          {tabs.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap text-sm ${activeTab === value
                ? 'bg-gray-800 text-gray-100'
                : 'bg-gray-100 text-gray-600'
                }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </div>
              <span className="text-xs ml-1 bg-gray-500 text-white px-2 py-0.5 rounded-full mt-1 md:mt-0">
                <NumberTicker value={count[value as keyof CountState]} />
              </span>
            </button>
          ))}
        </div>

        <div className="mt-4">
          {activeTab === 'meetings' && (
            <div className="p-4">
              <MeetingSlots userId={profile._id} />
            </div>
          )}
          {activeTab === 'followers' && (
            <div className="p-4">
              <FriendList userId={profile._id} type={`follower`} />
            </div>
          )}
          {activeTab === 'following' && (
            <div className="p-4">
              <FriendList userId={profile._id} type={`follower`} />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
