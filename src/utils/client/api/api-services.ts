import ShowToaster from "@/components/global-ui/toastify-toaster/show-toaster";
import api from "./api";
import { AxiosError, AxiosResponse } from "axios";

/**
 * ! API service
 */
const apiService = {
    get: async (url: string, params?: Record<string, unknown>) => {
        try {
            const response: AxiosResponse = await api.get(url, { params });
            return response.data;
        } catch (error: unknown) {
            // Catch any error that occurs in the delete request
            if (error instanceof AxiosError) {
                ShowToaster(error.response?.data.message || error.message, "error");
            } else {
                ShowToaster("Unexpected DELETE api server error!", "error");
            }
            return { success: false, message: "Unexpected error occurred." };  // Return a failure state
        }
    },

    post: async (url: string, data?: unknown) => {
        try {
            const response: AxiosResponse = await api.post(url, data);
            return response.data;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                console.log("POST Error:", error.response?.data || error.message);
                console.log(error);
                ShowToaster(error.response?.data.message || error.message, "error");
            } else {
                console.log("Unexpected Error:", error);
                ShowToaster("Unexpected POST api server error!", 'error');
            }
            return { success: false, message: "Unexpected error occurred." };;
        }
    },

    put: async (url: string, data?: unknown) => {
        try {
            const response: AxiosResponse = await api.put(url, data);
            return response.data;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                console.log("PUT Error:", error.response?.data || error.message);
                ShowToaster(error.response?.data.message || error.message, "error");
            } else {
                console.log("Unexpected Error:", error);
                ShowToaster("Unexpected PUT api server error!", 'error');
            }
            return { success: false, message: "Unexpected error occurred." };
        }
    },

    delete: async (url: string, data?: unknown) => {
        try {
            const response: AxiosResponse = await api.delete(url, { data });

            // Handle success and return data
            if (response.data.success) {
                return response.data; // Return the data with success status
            } else {
                // Handle error case from the backend
                ShowToaster(response.data.message || 'Unknown error', "error");
                return { success: false, message: response.data.message || 'Unknown error' };
            }
        } catch (error: unknown) {
            // Catch any error that occurs in the delete request
            if (error instanceof AxiosError) {
                ShowToaster(error.response?.data.message || error.message, "error");
            } else {
                ShowToaster("Unexpected DELETE api server error!", "error");
            }
            return { success: false, message: "Unexpected error occurred." };  // Return a failure state
        }
    }

};

export default apiService;