import apiService from "./api-services"

export const APIBookMeeting = async (slotId: string) => {
    const responseData = await apiService.post(`/api/user-slot-booking`, { slotId });
    return responseData;
}

export const APIDeleteMeeting = async (slotId: string) => {
    const responseData = await apiService.delete("/api/user-slot-booking", { slotId });
    return responseData;
}
