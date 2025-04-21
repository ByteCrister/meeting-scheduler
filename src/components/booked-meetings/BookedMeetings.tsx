'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import { dummyOfBookedSlotsData } from '@/utils/client/data';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import apiService from '@/utils/client/api/api-services';
import { addBookedMeetings, setBookedMeetingCurrentPage } from '@/lib/features/booked-meetings/bookedSlice';
import PaginateButtons from '../global-ui/ui-component/PaginateButtons';
import BookedMeetingsSkeleton from './BookedMeetingsSkeleton';
import MeetingCard from './MeetingCard';
import useBookedSearch from '@/hooks/useBookedSearch';


export default function BookedMeetings() {
  const { bookedMeetings, currentPage } = useAppSelector(state => state.meetingStore);
  const dispatch = useAppDispatch();
  const SearchBookedMeetings = useBookedSearch();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const maxItem = 4;


  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      const responseData = await apiService.get('/api/user-slot-booking');
      if (responseData.success) {
        if (responseData.data.length !== 0) dispatch(addBookedMeetings(responseData.data));

        else dispatch(addBookedMeetings(dummyOfBookedSlotsData));
      }
      setIsFetching(false);
    };
    fetchData();
  }, [dispatch]);


  const paginatedMeetings = useMemo(() => {
    const sorted = [...bookedMeetings].sort((a, b) => {
      const dateA = new Date(a.meetingDate ?? '').getTime();
      const dateB = new Date(b.meetingDate ?? '').getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return sorted.slice(
      maxItem * (currentPage - 1),
      (maxItem * (currentPage - 1)) + maxItem
    );
  }, [bookedMeetings, sortOrder, currentPage]);


  if (isFetching) return <BookedMeetingsSkeleton />;


  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    console.log(e.target.value);
    SearchBookedMeetings(e.target.value);
  };


  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Booked Meetings</h1>
        <p className="text-gray-500 mt-2">
          View and manage your scheduled meetings
        </p>
      </div>

      {/* Search and Sort Section */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-neutral-300 bg-neutral-50 text-neutral-800 placeholder-neutral-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.1)] focus:border-neutral-400 hover:shadow-md transition-all duration-200 ease-in-out"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {sortOrder === 'asc' ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Oldest First
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Newest First
              </>
            )}
          </button>
        </div>
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        {paginatedMeetings.map((meeting, index) => (
          <MeetingCard key={meeting._id + meeting.category + index} meeting={meeting} />
        ))}
      </div>

      {bookedMeetings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No meetings found</p>
        </div>
      )}

      {
        bookedMeetings.length !== 0 && (
          <PaginateButtons
            currentPage={currentPage}
            maxItems={maxItem}
            totalItems={bookedMeetings.length}
            handlePaginatePage={(newPage) => dispatch(setBookedMeetingCurrentPage(newPage))}
          />
        )
      }
    </div>
  );
}
