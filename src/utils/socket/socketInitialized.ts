import apiService from "../client/api/api-services";

let socketInitialized = false;

export const initializeServerSocket = async () => {
  if (!socketInitialized) {
    await apiService.get('/api/socket');
    socketInitialized = true;
  }
};
