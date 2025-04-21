'use client';

import React, { useState, useEffect } from 'react';
import { MeetingCard } from './MeetingCard';
import { MeetingCardSkeleton } from './MeetingCardSkeleton';
import { SearchBar } from './SearchBar';
import { SortOptions } from './SortOptions';
import { FilterOptions } from './FilterOptions';

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  guestSize: number;
  totalParticipants: number;
  engagementRate: number;
  category: string;
  host: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  thumbnail?: string;
}

export const PopularPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'popularity' | 'engagement'>('date');
  const [selectedCategory, setSelectedCategory] = useState<string>('category');

  const categories = ['category', 'Business', 'Product', 'Team', 'Client', 'Marketing'];

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setMeetings([
        {
          id: '1',
          title: 'Quarterly Strategy Meeting',
          date: '2024-03-25',
          time: '10:00 AM',
          guestSize: 12,
          totalParticipants: 15,
          engagementRate: 92,
          category: 'Business',
          host: 'John Smith',
          status: 'upcoming',
          thumbnail: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
          id: '2',
          title: 'Product Development Brainstorm',
          date: '2024-03-24',
          time: '02:30 PM',
          guestSize: 8,
          totalParticipants: 10,
          engagementRate: 88,
          category: 'Product',
          host: 'Sarah Johnson',
          status: 'ongoing',
          thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
          id: '3',
          title: 'Team Building Workshop',
          date: '2024-03-23',
          time: '11:00 AM',
          guestSize: 20,
          totalParticipants: 25,
          engagementRate: 95,
          category: 'Team',
          host: 'Michael Brown',
          status: 'completed',
          thumbnail: 'https://images.unsplash.com/photo-1522199755839-a2bacb67f546?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        }
      ]);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const filteredMeetings = meetings
    .filter(meeting =>
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedCategory === 'category' || meeting.category === selectedCategory))
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'popularity':
          return b.totalParticipants - a.totalParticipants;
        case 'engagement':
          return b.engagementRate - a.engagementRate;
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Popular Meetings</h1>
            <p className="mt-2 text-sm text-gray-600">
              Discover and join the most engaging meetings in your organization
            </p>
          </div>
        </div>

        <div className="dark:bg-muted p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-2">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2 items-center justify-between'>
              <SortOptions
                value={sortBy}
                onChange={(value) => setSortBy(value)}
              />
              <FilterOptions
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <MeetingCardSkeleton key={index} />
            ))
          ) : filteredMeetings.length > 0 ? (
            filteredMeetings.map(meeting => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No meetings found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 