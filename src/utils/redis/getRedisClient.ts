// utils/redis/redis.ts
import Redis from 'ioredis';

let redisStore: Redis | null = null;

const getRedisClient = (): Redis => {
    if (!redisStore) {
        redisStore = new Redis({
            host: process.env.REDIS_HOST!,
            port: Number(process.env.REDIS_PORT!),
            password: process.env.REDIS_PASSWORD!,
            tls: {},
            maxRetriesPerRequest: 10,
            retryStrategy: (times) => Math.min(times * 100, 5000),
            connectTimeout: 15000,
        });

        redisStore.ping()
            .then((res) => console.log("Redis connected:", res))
            .catch((err) => console.error("Redis ping failed:", err));

        redisStore.on('error', (err) => console.error("Redis error:", err));
        redisStore.on('maxRetriesPerRequest', (err) => console.error("Max retries reached:", err));
    }

    return redisStore;
};


export default getRedisClient;