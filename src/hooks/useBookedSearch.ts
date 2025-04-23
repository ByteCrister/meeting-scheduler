'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import Fuse from 'fuse.js';
import { debounce } from 'lodash';
import {
    formateSlotMeetingDate,
} from '@/components/my-slots/SlotCard';
import { BookedSlotsTypes } from '@/types/client-types';
import { setBookedMeetingCurrentPage, setSortedBookedMeetings } from '@/lib/features/booked-meetings/bookedSlice';
import { getDuration } from '@/utils/client/date-convertions/getDuration';


const useBookedSearch = () => {
    const { Store } = useAppSelector((state) => state.meetingStore);
    const dispatch = useAppDispatch();

    // * 3 : Fuse config with custom formatting
    const fuse = useMemo(() => {
        if (!Store) return null;

        return new Fuse(Store, {
            keys: [
                {
                    name: 'creator',
                    weight: 0.8,
                    getFn: (meeting: BookedSlotsTypes) => (meeting.creator?.toString().trim().toLowerCase().replace(/\s+/g, '') ?? ''),
                },
                {
                    name: 'title',
                    weight: 0.8,
                    getFn: (meeting: BookedSlotsTypes) => (meeting.title?.toString().trim().toLowerCase().replace(/\s+/g, '') ?? ''),
                },
                {
                    name: 'status',
                    weight: 0.7,
                    getFn: (meeting: BookedSlotsTypes) => (meeting.status?.toString().trim().toLowerCase().replace(/\s+/g, '') ?? ''),
                },
                {
                    name: 'category',
                    weight: 0.6,
                    getFn: (meeting: BookedSlotsTypes) => (meeting.category?.toString().trim().toLowerCase().replace(/\s+/g, '') ?? ''),
                },
                {
                    name: 'meetingDate',
                    weight: 0.5,
                    getFn: (meeting: BookedSlotsTypes) => formateSlotMeetingDate(meeting.meetingDate)?.toLowerCase().replace(/\s+/g, '') ?? '',
                },
                {
                    name: 'duration',
                    weight: 0.4,
                    getFn: (meeting: BookedSlotsTypes) => getDuration(meeting.durationFrom, meeting.durationTo).toLowerCase().replace(/\s+/g, ''),
                }

            ],

            threshold: 0.2, // lower = stricter; higher = looser match
            includeScore: true,
        });
    }, [Store]);

    // * 2 : call fuse and return result
    const debouncedSearch = useMemo(
        () =>
            debounce((query: string) => {
                if (!fuse || !Store) return;

                const trimmedQuery = query.trim().toLowerCase().replace(/\s+/g, '') ?? '';
                if (!trimmedQuery) {
                    // Empty query, show all
                    dispatch(setSortedBookedMeetings(Store));
                    dispatch(setBookedMeetingCurrentPage(1));
                    return;
                }

                const result = fuse.search(trimmedQuery);
                // Sort results by relevance (lowest score = best match)
                const sortedByBestMatch = result.sort((a, b) => a.score! - b.score!);
                const matchedSlots = sortedByBestMatch.map((r) => r.item);
                console.log(matchedSlots);
                dispatch(setSortedBookedMeetings(matchedSlots));
                dispatch(setBookedMeetingCurrentPage(1));
            }, 300),
        [fuse, Store, dispatch]
    );

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    // * 1 : call debouncedSearch
    return useCallback(
        (query: string) => {
            debouncedSearch(query);
        },
        [debouncedSearch]
    );
};

export default useBookedSearch;
