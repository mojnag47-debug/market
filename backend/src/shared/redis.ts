import { createClient } from 'redis';
import { env } from './config/env';
import { logger } from './logger';

type RedisClient = ReturnType<typeof createClient>;

const redisClient = createClient({
  url: env.REDIS_URL,
  ...(env.REDIS_PASSWORD && { password: env.REDIS_PASSWORD })
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));

const connectRedis = async (): Promise<RedisClient> => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  return redisClient;
};

const cache = {
  get: async <T>(key: string): Promise<T | null> => {
    const client = await connectRedis();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  },

  set: async <T>(key: string, value: T, ttlSeconds = 3600): Promise<void> => {
    const client = await connectRedis();
    await client.set(key, JSON.stringify(value), {
      EX: ttlSeconds
    });
  },

  invalidate: async (pattern: string): Promise<void> => {
    const client = await connectRedis();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  }
};

export { connectRedis, cache };