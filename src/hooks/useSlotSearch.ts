'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setCurrentPage, sortTempSlots } from '@/lib/features/Slots/SlotSlice';
import Fuse from 'fuse.js';
import { debounce } from 'lodash';
import {
    formatDateStringToDateYear,
    formateSlotMeetingDate,
} from '@/components/my-slots/SlotCard';
import { registerSlot } from '@/types/client-types';


const useSlotSearch = () => {
    const { Store } = useAppSelector((state) => state.slotStore);
    const dispatch = useAppDispatch();

    // * 3 : Fuse config with custom formatting
    const fuse = useMemo(() => {
        if (!Store) return null;

        return new Fuse(Store, {
            keys: [
                {
                    name: 'title',
                    weight: 1,
                    getFn: (slot: registerSlot) => (slot.title?.toString().trim().toLowerCase().replace(/\s+/g, '') ?? ''),
                },
                {
                    name: 'status',
                    weight: 1,
                    getFn: (slot: registerSlot) => (slot.status?.toString().trim().toLowerCase().replace(/\s+/g, '') ?? ''),
                },
                {
                    name: 'category',
                    weight: 1,
                    getFn: (slot: registerSlot) => (slot.category?.toString().trim().toLowerCase().replace(/\s+/g, '') ?? ''),
                },
                {
                    name: 'meetingDate',
                    weight: 1,
                    getFn: (slot: registerSlot) =>
                        formateSlotMeetingDate(slot.meetingDate)?.toLowerCase().replace(/\s+/g, '') ?? '',
                },
                {
                    name: 'createdAt',
                    weight: 1,
                    getFn: (slot: registerSlot) =>
                        formatDateStringToDateYear(slot.createdAt)?.toLowerCase().replace(/\s+/g, '') ?? '',
                },
                {
                    name: 'bookedUsers',
                    weight: 1,
                    getFn: (slot: registerSlot) =>
                        slot.bookedUsers?.length.toString().trim().toLowerCase().replace(/\s+/g, '') ?? '', // count as string
                },
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
                    dispatch(sortTempSlots(Store));
                    dispatch(setCurrentPage(1));
                    return;
                }

                const result = fuse.search(trimmedQuery);
                // Sort results by relevance (lowest score = best match)
                const sortedByBestMatch = result.sort((a, b) => a.score! - b.score!);
                const matchedSlots = sortedByBestMatch.map((r) => r.item);

                dispatch(sortTempSlots(matchedSlots));
                dispatch(setCurrentPage(1));
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

export default useSlotSearch;
