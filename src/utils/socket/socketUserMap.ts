// src>utils>socket>socketUserMap.ts

const userSocketMap = new Map<string, string>();

export const registerUserSocket = (userId: string, socketId: string) => {
  userSocketMap.set(userId, socketId);
};

export const removeUserSocket = (socketId: string) => {
  for (const [userId, sId] of userSocketMap.entries()) {
    if (sId === socketId) {
      userSocketMap.delete(userId);
      break;
    }
  }
};

export const getUserSocketId = (userId: string) => {
  return userSocketMap.get(userId);
};

export const getUserIdBySocketId = (socketId: string) => {
  for (const [userId, sId] of userSocketMap.entries()) {
    if (sId === socketId) {
      return userId;
    }
  }
  return null;
};