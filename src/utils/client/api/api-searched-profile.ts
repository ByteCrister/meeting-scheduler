import { ApiSPType } from "@/utils/constants";
import axios, { AxiosError } from "axios"

interface GetSearchedUserResponse {
    success: boolean;
    data: unknown;
}

export const getSearchedUser = async (
    userId: string,
    apiType: ApiSPType
): Promise<GetSearchedUserResponse> => {
    try {
        const response = await axios.get(`/api/searched-profile?searched_user_id=${userId}&type=${apiType}`, { withCredentials: true });
        return { success: true, data: response.data };
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            console.log(error.response?.data.message);
        }
        return { success: false, data: null };
    }
}
