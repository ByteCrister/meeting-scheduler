import axios from "axios";

export const getUserStatus = async () => {
    try {
        const response = await axios.get('/api/auth/status', { withCredentials: true });
        return response.data
    } catch (error) {
        console.log(error);
        return { success: false, user: null };
    }
};