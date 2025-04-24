'use client';

import { useEffect, useRef, useState } from 'react';
import MeetingCard from './MeetingCard';
import MeetingCardSkeleton from './MeetingCardSkeleton';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { addNewsFeeds, removeNewsFeedSlot, toggleIsSlotBooking } from '@/lib/features/news-feed/newsFeedSlice';
import { APIBookMeeting } from '@/utils/client/api/api-book-meetings';
import ShowToaster from '../global-ui/toastify-toaster/show-toaster';
import apiService from '@/utils/client/api/api-services';
import { useSearchParams } from 'next/navigation';
import { NewsFeedTypes } from '@/types/client-types';

interface NewsFeedResponse {
    success: boolean;
    data: { [key: string]: NewsFeedTypes };
    message?: string;
}

export default function MeetingPostFeed() {
    const searchParams = useSearchParams();
    const searchedMeetingPost = searchParams?.get('meeting-post') || '';

    const dispatch = useAppDispatch();
    const newsFeeds = useAppSelector((state) => state.newFeedStore.newsFeeds);
    const feedsList = Object.values(newsFeeds) as NewsFeedTypes[];

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useRef<HTMLDivElement>(null);

    const fetchFeeds = async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        setError(null);

        try {
            const response = await apiService.get(`/api/news-feed?page=${page}&meeting-post=${searchedMeetingPost}`);
            const res = response as NewsFeedResponse;

            if (res.success) {
                const feedList = Object.values(res.data || {});
                const feedsToAdd = feedList.reduce<{ [key: string]: NewsFeedTypes }>((acc, feed) => {
                    acc[feed._id] = feed;
                    return acc;
                }, {});

                dispatch(addNewsFeeds(feedsToAdd));

                if (feedList.length < 5) {
                    setHasMore(false);
                } else {
                    setPage((prev) => prev + 1);
                }
            } else {
                setHasMore(false);
                setError('Failed to fetch feeds');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setHasMore(false);
            setError('An error occurred while fetching feeds');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeeds();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchedMeetingPost]);

    useEffect(() => {
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    fetchFeeds();
                }
            },
            {
                rootMargin: '100px',
            }
        );

        if (lastElementRef.current) {
            observer.current.observe(lastElementRef.current);
        }

        return () => {
            if (observer.current) observer.current.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [feedsList, hasMore, loading]);

    const handleBookSlot = async (slotId: string) => {
        dispatch(toggleIsSlotBooking({ slotId, isBooking: true }));
        const responseData = await APIBookMeeting(slotId);
        if (responseData.success) {
            dispatch(removeNewsFeedSlot(slotId));
            ShowToaster(responseData.message, 'success');
        }
        dispatch(toggleIsSlotBooking({ slotId, isBooking: false }));
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Meeting Feed</h1>
                <p className="text-sm text-gray-500">Tap a card to view more and book</p>
            </div>

            <div className="space-y-4">
                {feedsList.map((feed, i) => (
                    <div key={feed._id} ref={i === feedsList.length - 1 ? lastElementRef : null}>
                        <MeetingCard
                            feed={feed}
                            handleBookSlot={handleBookSlot}
                            isExpand={i === 0}
                            meetingPost={searchedMeetingPost}
                        />
                    </div>
                ))}
                {loading && <MeetingCardSkeleton />}
                {!hasMore && feedsList.length > 0 && (
                    <p className="text-center text-gray-400 text-sm">No more feeds to load.</p>
                )}
                {!hasMore && feedsList.length === 0 && (
                    <p className="text-center text-gray-400 text-sm">No feeds available for this category.</p>
                )}
                {error && (
                    <p className="text-center text-red-500 text-sm">
                        {error} <button onClick={fetchFeeds} className="underline ml-2">Retry</button>
                    </p>
                )}
            </div>
        </div>
    );
}
