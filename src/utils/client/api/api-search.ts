import apiService from "./api-services";

export const APIGetSearchSuggestion = async (query: string) => {
    const responseData = await apiService.get(`/api/searching?q=${query}`);
    return responseData;
}

export const APIUpdateUsersSearchScore = async (userId: string) => {
    const responseData = await apiService.put(`/api/searching`, { userId });
    return responseData;
};