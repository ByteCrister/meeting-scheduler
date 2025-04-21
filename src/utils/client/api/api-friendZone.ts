import apiService from "./api-services";

// ? Followers API
export const getFollowers = async () => {
    const responseData = await apiService.get(`/api/followers`);
    return responseData;
};

export const removeFriend = async (followerId: string) => {
    const responseData = await apiService.delete(`/api/followers`, { followerId });
    return responseData;
};

export const unRemovedFriend = async (followerId: string) => {
    const responseData = await apiService.put(`/api/followers`, { followerId });
    return responseData;
};


// ? Following API
export const getFollowing = async () => {
    const responseData = await apiService.get(`/api/following`);
    return responseData;
};

export const followFriend = async (followingFriendId: string) => {
    const responseData = await apiService.post(`/api/following`, { followingFriendId });
    return responseData;
};

export const unfollowFriend = async (followingFriendId: string) => {
    const responseData = await apiService.delete(`/api/following`, { followingFriendId });
    return responseData;
};
