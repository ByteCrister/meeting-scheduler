'use client';

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Video } from "lucide-react"

export default function JoinMeeting({ isJoinEnabled, meetingId }: { isJoinEnabled: boolean, meetingId: string }) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={400}>
                <TooltipTrigger asChild>
                    <button
                        id={`booked-meeting-join-${meetingId}`}
                        className={`w-full sm:w-auto flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${isJoinEnabled
                            ? 'text-white bg-blue-600 hover:bg-blue-700'
                            : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            }`}
                        onClick={() => window.open(`/video-meeting?meetingId=${meetingId}`, '_blank')}
                        disabled={!isJoinEnabled}
                    >
                        <Video className="w-4 h-4 mr-2" />
                        Join
                    </button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{isJoinEnabled ? 'Join Meeting now' : `Can't join.`}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
