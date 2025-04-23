'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import MeetingCard from './MeetingCard';
import { addNewsFeeds, removeNewsFeedSlot, toggleIsSlotBooking } from '@/lib/features/news-feed/newsFeedSlice';
import ShowToaster from '../global-ui/toastify-toaster/show-toaster';
import apiService from '@/utils/client/api/api-services';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import LoadingSpinner from '../global-ui/ui-component/LoadingSpinner';
import MeetingCardSkeleton from './MeetingCardSkeleton';
import { APIBookMeeting } from '@/utils/client/api/api-book-meetings';


export default function MeetingPostFeed() {

    const newsFeeds = useAppSelector(state => state.newFeedStore.newsFeeds);
    const dispatch = useAppDispatch();

    const [hasMore, setHasMore] = useState(true);
    const [pageLoading, setPageLoading] = useState(false);
    const pageRef = useRef(1);

    const fetchLoadingRef = useRef(false);
    const hasMoreRef = useRef(true);


    // ? GET meeting slot feeds
    const fetchFeeds = useCallback(async () => {
        if (fetchLoadingRef.current || !hasMoreRef.current) return;

        fetchLoadingRef.current = true;
        setPageLoading(true);

        const responseData = await apiService.get(`/api/news-feed?page=${pageRef.current}`);

        if (responseData.success) {
            hasMoreRef.current = false;
            if (Object.values(responseData.data).length === 0) setHasMore(false);
            dispatch(addNewsFeeds(responseData.data));
        }

        fetchLoadingRef.current = false;
        setPageLoading(false);
    }, [dispatch]);


    useEffect(() => {
        fetchFeeds();
    }, [fetchFeeds]);

    const observer = useRef<IntersectionObserver | null>(null);
    const lastFeedRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (fetchLoadingRef.current) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMoreRef.current) {
                    fetchFeeds();
                }
            });
            if (node) observer.current.observe(node);
        },
        [fetchFeeds]
    );

    // ? API user booked a meeting slot
    const handleBookSlot = async (slotId: string) => {
        dispatch(toggleIsSlotBooking({ slotId: slotId, isBooking: true }));
        const responseData = await APIBookMeeting(slotId);
        if (responseData.success) {
            dispatch(removeNewsFeedSlot(slotId));
            ShowToaster(responseData.message, 'success');
        } else {
            dispatch(toggleIsSlotBooking({ slotId: slotId, isBooking: false }));
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Meeting Feed</h1>
                <p className="text-sm text-gray-500">Tap a card to view more and book</p>
            </div>

            <div className="space-y-4">
                {newsFeeds
                    && Object.values(newsFeeds).length !== 0
                    && Object.values(newsFeeds).map((feed, index) => {
                        const isLast = Object.values(newsFeeds).length === index + 1;
                        return (
                            <div
                                key={feed._id}
                                ref={isLast ? lastFeedRef : null}
                            >
                                <MeetingCard
                                    feed={feed}
                                    handleBookSlot={handleBookSlot}
                                />
                            </div>
                        );
                    })}
            </div>
            {pageLoading && <MeetingCardSkeleton />}
            {fetchLoadingRef.current && <LoadingSpinner />}
            {!hasMore && (
                <div className="col-span-full text-center text-gray-500 mt-4">
                    No more new feed available.
                </div>
            )}
        </div>
    );
}
