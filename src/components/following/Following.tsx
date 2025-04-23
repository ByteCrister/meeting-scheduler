'use client';

import React, { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import useFriendListSearch from '@/hooks/useFriendListSearch';
import { getFollowing } from '@/utils/client/api/api-friendZone';
import { setCurrentPage, setFriendList } from '@/lib/features/friend-zone/friendZoneSlice';
import PaginateButtons from '../global-ui/ui-component/PaginateButtons';
import FriendDropDialog from '../global-ui/dialoges/FriendDropDialog';
import { Search } from 'lucide-react';
import FollowingCard from './FollowingCard';
import FollowingCardSkeleton from './FollowingCardSkeleton';


export default function Following() {
  const { friendList, currentPage } = useAppSelector(state => state.friendZoneStore);
  const dispatch = useAppDispatch();

  const UseSearch = useFriendListSearch();
  const maxItemsPerPage = 4;

  const [searchQuery, setSearchQuery] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      const response = await getFollowing();
      if (response.success) {
        dispatch(setFriendList(response.data));
        dispatch(setCurrentPage(1));
      }
      setIsFetching(false);
    };
    fetchData();
  }, [dispatch]);


  const handleSearch = (searedItem: string) => {
    setSearchQuery(searedItem);
    UseSearch(searedItem);
  };

  return (
    <>
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Following</h1>
          <p className="text-gray-500 mt-2">
            People you follow ({friendList?.length || 0})
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search meeting slots..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-neutral-300 bg-neutral-50 text-neutral-800 placeholder-neutral-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.1)] focus:border-neutral-400 hover:shadow-md transition-all duration-200 ease-in-out"
            />
          </div>
        </div>

        {
          isFetching
            ? <FollowingCardSkeleton />
            : <>
              {/* Following List */}
              <div className="space-y-4">
                {friendList && friendList?.slice(
                  maxItemsPerPage * (currentPage - 1),
                  (maxItemsPerPage * (currentPage - 1)) + maxItemsPerPage
                ).map((user) => (
                  <FollowingCard
                    key={user.id}
                    following={user}
                  />
                ))}
              </div>
            </>
        }

        {
          friendList?.length !== 0 && <PaginateButtons
            currentPage={currentPage}
            maxItems={maxItemsPerPage}
            totalItems={friendList?.length || 0}
            handlePaginatePage={(newPage) => dispatch(setCurrentPage(newPage))}
          />
        }

        {!friendList || friendList.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">You are not following anyone yet.</p>
          </div>
        )}
      </div>
      <FriendDropDialog listType='following' />
    </>
  );
}
