"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toggleUpdateProfileDialog } from "@/lib/features/component-state/componentSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import UpdateImage from "./UpdateImage";
import UpdateBio from "./UpdateBio";
import UpdateDetails from "./UpdateDetails";

const Section = {
    'image': <UpdateImage />,
    'bio': <UpdateBio />,
    'details': <UpdateDetails />
}

export function UpdateProfileDialog() {
    const { isOpen, updateField } = useAppSelector(state => state.componentStore.profileUpdateDialog);
    const dispatch = useAppDispatch();

    const handleOnOpenChange = () => {
        const payload = {
            isOpen: false,
            image: null,
            updateField: null,
            username: null,
            title: null,
            category: null,
            timeZone: null
        };
        dispatch(toggleUpdateProfileDialog(payload));
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOnOpenChange} >
            <DialogContent className="sm:max-w-[425px] border-none shadow-none outline-none">
                <section className="bg-white p-5 rounded">
                    <DialogHeader>
                        <DialogTitle className="text-blue-950 font-inter">Edit profile</DialogTitle>
                        <DialogDescription className="text-blue-950 font-inter">
                            Make changes to your profile here. Click Update when you&apos;re done.
                        </DialogDescription>
                    </DialogHeader>
                    {updateField !== null ? Section[updateField] : null}
                </section>
            </DialogContent>
        </Dialog>
    )
};