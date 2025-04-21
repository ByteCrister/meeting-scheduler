import apiService from "./api-services";

export default async function ApiStatusUpdate(type: string) {
    const responseData = await apiService.post(`/api/auth/status?type=${type}`);
    return responseData;
}