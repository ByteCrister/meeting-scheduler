"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { setFriendDropDialog } from "@/lib/features/component-state/componentSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { removeFriend, unfollowFriend } from "@/utils/client/api/api-friendZone";
import { useState } from "react";
import ShowToaster from "../toastify-toaster/show-toaster";
import { toggleIsRemoved } from "@/lib/features/friend-zone/friendZoneSlice";

type PropTypes = { listType: ('followers' | 'following') };

const FriendDropDialog = ({ listType }: PropTypes) => {
  const { friendDropDialog } = useAppSelector(state => state.componentStore);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const dispatch = useAppDispatch();

  const onClose = () => {
    dispatch(setFriendDropDialog({ isOpen: false, user: null }));
  };

  const handleDialogAction = async () => {
    const userId = friendDropDialog.user?.id;
    if (!userId) return;

    setIsLoading(true);

    const responseData = listType === 'followers'
      ? await removeFriend(userId)
      : await unfollowFriend(userId);

    if (responseData.success) {
      ShowToaster(responseData.message, 'success');
      if (listType === 'followers') dispatch(toggleIsRemoved({ id: userId, isRemoved: true }));
    }
    if (listType === 'followers') dispatch(toggleIsRemoved({ id: userId, isRemoved: true }));

    setIsLoading(false);
  };


  const handleOnChange = () => {
    dispatch(setFriendDropDialog({ isOpen: false, user: null }));
  }

  return (
    <AlertDialog open={friendDropDialog.isOpen} onOpenChange={handleOnChange}>
      <AlertDialogContent className="border-gray-400 !rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{listType === 'followers' ? 'Remove' : 'Unfollow'}</AlertDialogTitle>
          <AlertDialogDescription>
            {listType === 'followers'
              ? `Are you sure to remove ${friendDropDialog.user?.name}?`
              : `Are you sure to unfollow ${friendDropDialog.user?.name}`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* Hide AlertDialogCancel during btn loading */}
          {!isLoading && <AlertDialogCancel onClick={onClose} className="rounded-2xl hover:bg-slate-200 border-none cursor-pointer">Cancel</AlertDialogCancel >}
          {/* Active loading during api call */}
          <AlertDialogAction
            onClick={handleDialogAction}
            className="hover:bg-rose-700 rounded-2xl cursor-pointer">
            {isLoading
              ? <span className="loading loading-spinner text-primary"></span>
              : listType === 'followers'
                ? 'Remove'
                : 'Unfollow'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

  )
}

export default FriendDropDialog;