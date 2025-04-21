"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toggleAlertLogOut } from "@/lib/features/component-state/componentSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import apiService from "@/utils/client/api/api-services";
import { useState } from "react";
import ShowToaster from "../toastify-toaster/show-toaster";
import { useRouter } from "next/navigation";

export default function AlertLogout() {
    const [loading, setLoading] = useState(false);
    const router = useRouter()
    
    const { isOpen } = useAppSelector(state => state.componentStore.alertLogOut);
    const dispatch = useAppDispatch();

    const handleOpenChange = () => {
        dispatch(toggleAlertLogOut(false));
    };

    const handleLogout = async () => {
        setLoading(true);
        const responseData = await apiService.delete(`/api/auth/user/signin`);
        if (responseData.success) {
            router.push('/');
        } else {
            ShowToaster('Please try again later. There is something issue.', 'error');
        }
        setLoading(false);
    };

    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent className="bg-blue-50 border-none outline-none rounded-xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-blue-950 font-inter">Are you absolutely sure to logout?</AlertDialogTitle>
                    <AlertDialogDescription className="text-stone-400 font-inter">
                        Your actions will be saved to database. We will see you soon!
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    {
                        loading
                            ? <div className="w-full flex items-center justify-center"><span className="loading loading-spinner bg-blue-900 loading-md"></span></div>
                            : <>
                                <AlertDialogCancel onClick={handleOpenChange} className="bg-blue-950 hover:bg-blue-200 hover:text-blue-950 rounded">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleLogout} className="bg-blue-950 hover:bg-blue-200 hover:text-blue-950 rounded">Logout</AlertDialogAction>
                            </>
                    }
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}  