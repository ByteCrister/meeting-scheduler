'use client';

import LoadingSpinner from '@/components/global-ui/ui-component/LoadingSpinner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { APILogout } from '@/utils/client/api/api-logout';
import React, { Dispatch, SetStateAction, useState } from 'react'

const LogoutAlert = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: Dispatch<SetStateAction<boolean>>; }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleLogOut = async () => {
        setIsLoading(true);
        const resData = await APILogout();
        if (resData.success) {
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        };
        setIsLoading(false);
    };
    return (
        <AlertDialog open={isOpen} onOpenChange={() => setIsOpen(false)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will log you out of your account. You’ll need to log back in to continue.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    {
                        isLoading
                            ? <LoadingSpinner />
                            : <>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleLogOut}>Logout</AlertDialogAction>
                            </>
                    }
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog >
    )
}

export default LogoutAlert