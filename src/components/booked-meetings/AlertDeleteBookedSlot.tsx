'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toggleDeleteBookedSlotAlert } from "@/lib/features/component-state/componentSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useState } from "react";
import ShowToaster from "@/components/global-ui/toastify-toaster/show-toaster";
import LoadingSpinner from "../global-ui/ui-component/LoadingSpinner";
import { APIDeleteMeeting } from "@/utils/client/api/api-book-meetings";
import { deleteBookedMeeting } from "@/lib/features/booked-meetings/bookedSlice";

export function AlertDeleteBookedSlot() {
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const deleteBookedSlotAlert = useAppSelector(
    (state) => state.componentStore.deleteBookedSlotAlert
  );
  const slotId = deleteBookedSlotAlert.slotId;

  const handleBookedSlotDelete = async () => {
    if (!slotId) return;

    setLoading(true);
    const responseData =await APIDeleteMeeting(slotId);

    if (responseData.success) {
      dispatch(deleteBookedMeeting(slotId));
      ShowToaster(responseData.message, 'success');
      setLoading(false);
      dispatch(toggleDeleteBookedSlotAlert({ isOpen: false, slotId: null }));
    }
    setLoading(false);
  };


  return (
    <AlertDialog open={deleteBookedSlotAlert.isOpen}>
      <AlertDialogContent className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white rounded-xl border-none shadow-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-blue-100">
            This action cannot be undone. This will permanently delete this slot.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {loading ? (
            <div className="flex items-center justify-center text-center w-full">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <AlertDialogCancel onClick={() => dispatch(toggleDeleteBookedSlotAlert({ isOpen: false, slotId: null }))} className="bg-white text-blue-600 hover:bg-gray-100 hover:text-stone-600 font-semibold rounded cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBookedSlotDelete}
                className="bg-red-500 hover:bg-red-700 text-white font-semibold rounded cursor-pointer"
              >
                Delete
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
