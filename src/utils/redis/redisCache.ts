import getRedisClient from "./getRedisClient";

export const redisCache = {
    get: async (key: string) => {
        const redis = getRedisClient();
        return redis.get(key);
    },
    set: async (key: string, value: string, ttlSeconds = 300) => {
        const redis = getRedisClient();
        return redis.set(key, value, 'EX', ttlSeconds);
    },
    del: async (key: string) => {
        const redis = getRedisClient();
        return redis.del(key);
    }
};
