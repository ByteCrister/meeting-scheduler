import ShowToaster from "@/components/global-ui/toastify-toaster/show-toaster";
import LoadingSpinner from "@/components/global-ui/ui-component/LoadingSpinner";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { APIBookMeeting, APIDeleteMeeting } from "@/utils/client/api/api-book-meetings";
import { Plus } from "lucide-react";
import React from "react";

type PropType = {
    status: "upcoming" | "ongoing" | "completed" | "expired";
    isBooked: boolean;
    loadingBtns: {
        [key: string]: boolean;
    };
    handleLoadingBtns: (meetingSlotId: string, operation: "add" | "delete") => void;
    meetingSlotId: string;
};

const statusMessages: Record<string, string> = {
    upcoming: "Book Meeting",
    completed: "Meeting has ended.",
    ongoing: "Meeting is started.",
    expired: "Meeting time has expired.",
};

const CAT = (prop: PropType) => {
    return (
        <div className="pt-1">
            <TooltipCATButton {...prop} />
        </div>
    );
};

export default CAT;

function TooltipCATButton({ status, isBooked, loadingBtns, handleLoadingBtns, meetingSlotId }: PropType) {

    const handleBooking = async () => {
        handleLoadingBtns(meetingSlotId, 'add');
        const responseData = await APIBookMeeting(meetingSlotId);
        if (responseData.success) {
            ShowToaster(responseData.message, 'success');
        }
        handleLoadingBtns(meetingSlotId, 'delete');
    };

    const handleRemoveBooking = async () => {
        handleLoadingBtns(meetingSlotId, 'add');
        const responseData = await APIDeleteMeeting(meetingSlotId);
        if (responseData.success) {
            ShowToaster(responseData.message, 'success');
        }
        handleLoadingBtns(meetingSlotId, 'delete');
    }

    const message = statusMessages[status] || "Meeting time has expired.";
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {
                        loadingBtns[meetingSlotId]
                            ? <LoadingSpinner />
                            : <Button
                                variant="default"
                                disabled={loadingBtns[meetingSlotId] || status !== "upcoming"}
                                onClick={() => isBooked ? handleRemoveBooking() : handleBooking()}
                                className="w-full bg-gray-700 rounded-xl text-base font-medium flex items-center justify-center gap-2 group hover:bg-gray-800 transition-all"
                            >
                                <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                {isBooked ? "Remove Meeting " : "Book Meeting"}
                            </Button>
                    }
                </TooltipTrigger>
                <TooltipContent>
                    <p>{message}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
