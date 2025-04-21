"use client";

import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { toggleAlertDialog } from "@/lib/features/component-state/componentSlice";

const AlertDialogComponent = () => {
  const { alertDialogState } = useAppSelector((state) => state.componentStore);
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(alertDialogState.isOpen);

  // Sync state with Redux store
  useEffect(() => {
    setIsOpen(alertDialogState.isOpen);
  }, [alertDialogState.isOpen]);

  const closeDialog = () => {
    dispatch(toggleAlertDialog({ isOpen: false, title: "", description: "" }));
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="outline-none border-none shadow-2xl bg-gray-900 rounded-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-50">{alertDialogState.title}</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-50">
            {alertDialogState.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className="bg-blue-950 text-white rounded hover:bg-blue-800 duration-150 ease-in-out cursor-pointer" onClick={closeDialog}>Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertDialogComponent;