import { FriendTypes } from "@/components/followers/Followers";
import { setCurrentPage, setSortedFriendList } from "@/lib/features/friend-zone/friendZoneSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import Fuse from "fuse.js";
import { debounce } from "lodash";
import { useCallback, useEffect, useMemo } from "react";

const useFriendListSearch = () => {
    const friendListStore = useAppSelector((state) => state.friendZoneStore.friendListStore);
    const dispatch = useAppDispatch();

    const fuse = useMemo(() => {
        if (!friendListStore) return null;

        return new Fuse(friendListStore, {
            keys: [
                {
                    name: 'name',
                    weight: 0.7,
                    getFn: (item: FriendTypes) => (item.name?.toString().trim().toLowerCase().replace(/\s+/g, '') ?? ''),
                },
                {
                    name: 'title',
                    weight: 0.6,
                    getFn: (item: FriendTypes) => (item.title?.toString().trim().toLowerCase().replace(/\s+/g, '') ?? ''),
                },
            ],
            threshold: 0.3,
            includeScore: true,
        });
    }, [friendListStore]);

    const debouncedSearch = useMemo(
        () =>
            debounce((query: string) => {
                if (!fuse || !friendListStore) return;

                const trimmedQuery = query.toLowerCase().trim().replace(/\s+/g, "");
                if (!trimmedQuery) {
                    dispatch(setSortedFriendList(friendListStore));
                    dispatch(setCurrentPage(1));
                    return;
                }

                const result = fuse.search(trimmedQuery);
                // Sort results by relevance (lowest score = best match)
                const sortedByBestMatch = result.sort((a, b) => a.score! - b.score!);
                const matchedFriends = sortedByBestMatch.map((r) => r.item);

                dispatch(setSortedFriendList(matchedFriends));
                dispatch(setCurrentPage(1));
            }, 300),
        [fuse, friendListStore, dispatch]
    );

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    return useCallback((query: string) => {
        debouncedSearch(query);
    }, [debouncedSearch]);
};

export default useFriendListSearch ;