"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toggleNotifyChangeDialog } from "@/lib/features/component-state/componentSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import React, { useState } from "react";
import ShowToaster from "../../global-ui/toastify-toaster/show-toaster";
import { deleteNotification, updateNotification } from "@/lib/features/users/userSlice";
import LoadingSpinner from "../ui-component/LoadingSpinner";
import { APIdeleteNotification, APIputChangePreference } from "@/utils/client/api/api-notifications";

const NotifyChangeDialog = () => {
    const { isOpen, mode, senderId, notificationId, isDisable } = useAppSelector(
        (state) => state.componentStore.notifyChangeDialog
    );
    const dispatch = useAppDispatch();
    const [isLoading, seIsLoading] = useState<boolean>(false);

    const handleDialog = () => {
        dispatch(
            toggleNotifyChangeDialog({
                isOpen: false,
                notificationId: null,
                senderId: null,
                mode: mode,
                isDisable: false
            })
        );
    };

    // ? API delete notification
    const handleDelete = async () => {
        seIsLoading(true);
        const responseData = await APIdeleteNotification (notificationId!);
        if (responseData.success) {
            dispatch(deleteNotification(notificationId!));
            ShowToaster(responseData.message, 'success');
            dispatch(
                toggleNotifyChangeDialog({
                    isOpen: false,
                    notificationId: null,
                    senderId: null,
                    mode: mode,
                    isDisable: false
                })
            );
        }
        seIsLoading(false);
    };

    // ? API mute user notification or enable  
    const handleChangePreference = async () => {
        seIsLoading(true);
        const responseData = await APIputChangePreference(senderId!);
        if (responseData.success) {
            dispatch(updateNotification({ field: 'isDisable', value: responseData.isDisable!, _id: notificationId! }));
            ShowToaster(responseData.message, 'success');
            dispatch(
                toggleNotifyChangeDialog({
                    isOpen: false,
                    notificationId: null,
                    senderId: null,
                    mode: mode,
                    isDisable: false
                })
            );
        }
        seIsLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleDialog}>
            <DialogContent className="shadow-none outline-none border-none">
                <section className={`bg-white rounded`}>
                    <DialogHeader>
                        <DialogTitle className={`text-gray-700 font-inter p-3`}>
                            {mode === "notification"
                                ? "Change notification preference"
                                : "Do you want to delete?"}
                        </DialogTitle>
                        <hr className="w-[100%] h-1 mx-auto my-4 bg-gray-600 border-0 rounded-sm md:my-10 dark:bg-gray-700" />
                    </DialogHeader>
                    <DialogFooter className="p-4 text-gray-700 text-center">
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : mode === "delete" ? (
                            <Button asChild>
                                <button
                                    type="submit"
                                    className="bg-red-500 text-white hover:bg-red-300 transition-all duration-200 ease-in-out px-4 py-2 rounded-[5px]"
                                    onClick={handleDelete}
                                >
                                    Delete
                                </button>
                            </Button>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        defaultChecked={isDisable}
                                        className="sr-only peer"
                                        value=""
                                        onChange={handleChangePreference}
                                    />
                                    <div className="group peer bg-white rounded-full duration-300 w-16 h-8 ring-2 ring-red-500 after:duration-300 after:bg-red-500 peer-checked:after:bg-green-500 peer-checked:ring-green-500 after:rounded-full after:absolute after:h-6 after:w-6 after:top-1 after:left-1 after:flex after:justify-center after:items-center peer-checked:after:translate-x-8 peer-hover:after:scale-95"></div>
                                </label>
                            </div>
                        )}
                    </DialogFooter>
                </section>
            </DialogContent>
        </Dialog>
    );
};

export default NotifyChangeDialog;
