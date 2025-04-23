// api-services.ts

import apiService from "./api-services";

// Define response types for API calls
export interface ApiResponse {
    success: boolean;
    message: string;
    data?: unknown; // Optional field for returning data
    isDisable?: boolean; // For the mute preference toggle response
}

export const APIgetAllInitialNotifications = async (): Promise<ApiResponse> => {
    const responseData = await apiService.get(`/api/notifications`);
    return responseData;
}

export const APIupdateNotificationField = async (
    field: 'isClicked' | 'isRead',
    value: boolean,
    notificationId: string
): Promise<ApiResponse> => {
    const responseData = await apiService.post(
        `/api/notifications?field=${field}&value=${value}&notificationId=${notificationId}`
    );
    return responseData;
};


export const APIdeleteNotification = async (notificationId: string): Promise<ApiResponse> => {
    const responseData = await apiService.delete('/api/notifications', { notificationId });
    return responseData;
}

export const APIputChangePreference = async (senderId: string): Promise<ApiResponse> => {
    const responseData = await apiService.put('/api/notifications', { senderId });
    return responseData;
}
