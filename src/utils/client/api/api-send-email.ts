import { ApiSendEmailType } from "@/utils/constants";
import axios, { AxiosError } from "axios";

export const APISendUpdatedTimeZoneEmail = async (value?: unknown) => {
    try {
        await axios.post(`/api/send-email`, { type: ApiSendEmailType.UPDATE_TIME_ZONE, value: value });
        return;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.log("Post Error:", error.response?.data || error.message);
        } else {
            console.log("Unexpected Error:", error);
        }
    }
}; 