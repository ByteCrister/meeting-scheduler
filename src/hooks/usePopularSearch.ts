'use client';

import { Dispatch, SetStateAction, useCallback, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { debounce } from 'lodash';
import {
    formateSlotMeetingDate,
} from '@/components/my-slots/SlotCard';
import { PopularMeeting } from '@/types/client-types';


const usePopularSearch = (
    Store: {
        Store: PopularMeeting[];
        meetings: PopularMeeting[];
    },
    setStore: Dispatch<SetStateAction<{
        Store: PopularMeeting[];
        meetings: PopularMeeting[];
    }>>
) => {


    // * 3 : Fuse config with custom formatting
    const fuse = useMemo(() => {
        if (!Store.Store) return null;

        return new Fuse(Store.Store, {
            keys: [
                {
                    name: 'title',
                    weight: 1,
                    getFn: (meeting: PopularMeeting) => (meeting.title?.toString().trim().toLowerCase().replace(/\s+/g, '') ?? ''),
                },
                {
                    name: 'status',
                    weight: 1,
                    getFn: (meeting: PopularMeeting) => (meeting.status?.toString().trim().toLowerCase().replace(/\s+/g, '') ?? ''),
                },
                {
                    name: 'category',
                    weight: 1,
                    getFn: (meeting: PopularMeeting) => (meeting.category?.toString().trim().toLowerCase().replace(/\s+/g, '') ?? ''),
                },
                {
                    name: 'meetingDate',
                    weight: 1,
                    getFn: (meeting: PopularMeeting) => formateSlotMeetingDate(meeting.meetingDate)?.toLowerCase().replace(/\s+/g, '') ?? '',
                },
                {
                    name: 'durationFrom',
                    weight: 1,
                    getFn: (meeting: PopularMeeting) =>
                        meeting.durationFrom?.toLowerCase().replace(/\s+/g, '') ?? '',
                },
                {
                    name: 'guestSize',
                    weight: 1,
                    getFn: (meeting: PopularMeeting) =>
                        meeting.guestSize.toString().toLowerCase().replace(/\s+/g, '') ?? '',
                },
                {
                    name: 'totalParticipants',
                    weight: 1,
                    getFn: (meeting: PopularMeeting) =>
                        meeting.totalParticipants.toString().toLowerCase().replace(/\s+/g, '') ?? '',
                },
                {
                    name: 'engagementRate',
                    weight: 1,
                    getFn: (meeting: PopularMeeting) =>
                        `${meeting.engagementRate * 100}%`.toString().toLowerCase().replace(/\s+/g, '') ?? '',
                },
            ],

            threshold: 0.2, // lower = stricter; higher = looser match
            includeScore: true,
        });
    }, [Store.Store]);

    // * 2 : call fuse and return result
    const debouncedSearch = useMemo(
        () =>
            debounce((query: string) => {
                if (!fuse || !Store.Store) return;

                const trimmedQuery = query.trim().toLowerCase().replace(/\s+/g, '') ?? '';
                if (!trimmedQuery) {
                    // Empty query, show all
                    setStore((prev) => ({ ...prev, meetings: Store.Store }));
                    return;
                }

                const result = fuse.search(trimmedQuery);
                // Sort results by relevance (lowest score = best match)
                const sortedByBestMatch = result.sort((a, b) => a.score! - b.score!);
                const matchedMeetings = sortedByBestMatch.map((r) => r.item);

                setStore((prev) => ({ ...prev, meetings: matchedMeetings }));
            }, 300),

        [Store.Store, fuse, setStore]
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

export default usePopularSearch;