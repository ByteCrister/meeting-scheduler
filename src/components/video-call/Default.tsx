'use client';

import { useSearchParams } from "next/navigation";
import { VideoCallInterface } from "./VideoCallInterface";

const Default = () => {
    const searchParams = useSearchParams()
    const meetingId = searchParams?.get('meetingId');

    const onEndCall = () => {
        window.close();
    };

    return (
        <VideoCallInterface
            meetingId={meetingId!}
            onEndCall={onEndCall}
        />
    )
}

export default Default