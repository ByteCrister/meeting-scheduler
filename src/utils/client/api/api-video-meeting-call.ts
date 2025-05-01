import apiService from './api-services';

interface VideoCallUpdateData {
    meetingId: string;
    isMuted?: boolean;
    isVideoOn?: boolean;
    isScreenSharing?: boolean;
    message?: string;
}

export const createVideoCall = async (meetingId: string) => {
    const resData = await apiService.post(`/api/video-meeting-call`, { meetingId });
    return resData;
};


export const joinVideoCall = async (meetingId: string) => {
    const resData = await apiService.get('/api/video-call/join', {
        params: { meetingId }
    });
    return resData;
};


export const updateVideoCall = async (data: VideoCallUpdateData) => {
    const resData = await apiService.put(`/api/video-meeting-call`, data);
    return resData;
};


export const leaveVideoCall = async (meetingId: string) => {
    const resData = await apiService.delete(`/api/video-meeting-call/join?meetingId=${meetingId}`);
    return resData;
};