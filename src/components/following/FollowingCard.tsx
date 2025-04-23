'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserMinus, UserPlus } from 'lucide-react';
import { FriendTypes } from '../followers/Followers';
import { useAppDispatch } from '@/lib/hooks';
import { setFriendDropDialog } from '@/lib/features/component-state/componentSlice';
import { useCallback } from 'react';
import { addNewFriend, toggleIsBtnLoading } from '@/lib/features/friend-zone/friendZoneSlice';
import { followFriend } from '@/utils/client/api/api-friendZone';
import LoadingSpinner from '../global-ui/ui-component/LoadingSpinner';

const FollowingCard = ({ following }: { following: FriendTypes; }) => {
    const dispatch = useAppDispatch();

    const handleUndoUnFollow = useCallback(async () => {
        dispatch(toggleIsBtnLoading({ id: following.id, isLoading: true }));
        const responseData = await followFriend(following.id);
        if (responseData.success) {
            dispatch(addNewFriend(responseData.data));
        }
        dispatch(toggleIsBtnLoading({ id: following.id, isLoading: false }));
    }, [dispatch, following.id]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
        >
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <Link href={`/searched-profile?user=${following.id}`} className="flex items-center space-x-4 flex-1">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden">
                            <Image
                                src={following.image}
                                alt={following.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                                {following.name}
                            </h3>
                            <p className="text-sm text-gray-500">{following.title}</p>
                        </div>
                    </Link>
                    {
                        following.isLoading ? (
                            <LoadingSpinner />
                        ) : following.isRemoved ? (
                            <button
                                onClick={handleUndoUnFollow}
                                className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 text-xs rounded-full hover:bg-blue-100 hover:text-blue-700 transition-all shadow-sm cursor-pointer"
                            >
                                <UserPlus className="w-4 h-4" />
                                Follow
                            </button>
                        )
                            : (
                                <button
                                    onClick={() => dispatch(setFriendDropDialog({ isOpen: true, user: following }))}
                                    className="p-2 rounded-full hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                                >
                                    <UserMinus className="w-5 h-5" />
                                </button>
                            )
                    }

                </div>
            </div>
        </motion.div>
    );
};

export default FollowingCard;