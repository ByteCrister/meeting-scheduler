'use client';

import Image from "next/image";
import Link from "next/link";
import { motion } from 'framer-motion';
import { UndoIcon, X } from "lucide-react";
import { FriendTypes } from "./Followers";
import { useAppDispatch } from "@/lib/hooks";
import { setFriendDropDialog } from "@/lib/features/component-state/componentSlice";
import LoadingSpinner from "../global-ui/ui-component/LoadingSpinner";
import { unRemovedFriend } from "@/utils/client/api/api-friendZone";
import { useCallback } from "react";
import { addNewFriend, toggleIsBtnLoading } from "@/lib/features/friend-zone/friendZoneSlice";

const FollowerCard = ({ follower }: { follower: FriendTypes; }) => {
    const dispatch = useAppDispatch();

    const handleUndoRemoveFollower = useCallback(async () => {
        dispatch(toggleIsBtnLoading({ id: follower.id, isLoading: true }));
        const responseData = await unRemovedFriend(follower.id);
        if (responseData.success) {
            dispatch(addNewFriend(responseData.data));
        }
        dispatch(toggleIsBtnLoading({ id: follower.id, isLoading: false }));
    }, [dispatch, follower.id]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
        >
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <Link href={`/profile/${follower.id}`} className="flex items-center space-x-4 flex-1">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden">
                            <Image
                                src={follower.image}
                                alt={follower.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                                {follower.name}
                            </h3>
                            <p className="text-sm text-gray-500">{follower.title}</p>
                        </div>
                    </Link>
                    {
                        follower.isLoading ? (
                            <LoadingSpinner />
                        ) : follower.isRemoved ? (
                            <button
                                onClick={handleUndoRemoveFollower}
                                className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 text-xs rounded-full hover:bg-blue-100 hover:text-blue-700 transition-all shadow-sm cursor-pointer"
                            >
                                <UndoIcon className="w-4 h-4" />
                                Undo
                            </button>
                        ) : (
                            <button
                                onClick={() => dispatch(setFriendDropDialog({ isOpen: true, user: follower }))}
                                className="p-2 rounded-full hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )
                    }

                </div>
            </div>
        </motion.div>
    );
};

export default FollowerCard;