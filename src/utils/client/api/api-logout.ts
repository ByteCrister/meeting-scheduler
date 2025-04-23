import apiService from "./api-services"

export const APILogout = async () => {
    const responseData = await apiService.delete(`/api/auth/user/signup`);
    return responseData;
};