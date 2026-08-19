import IORedis from 'ioredis';
import { env } from './env';
import { createChildLogger } from './logger';

const logger = createChildLogger('redis');

export const getRedisConnectionOptions = () => {
  if (env.REDIS_URL) {
    return {
      url: env.REDIS_URL,
      maxRetriesPerRequest: null,
    };
  }
  return {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
  };
};

export const createRedisInstance = (overrideOptions: object = {}) => {
  if (env.REDIS_URL) {
    return new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      ...overrideOptions,
    });
  }
  return new IORedis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
    ...overrideOptions,
  });
};

export const redisConnection = createRedisInstance({ lazyConnect: true });

redisConnection.on('connect', () => logger.info('Redis connected'));
redisConnection.on('error', (err) => logger.error({ err }, 'Redis connection error'));
