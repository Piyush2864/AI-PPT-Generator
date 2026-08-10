import IORedis from 'ioredis';
import { env } from './env';
import { createChildLogger } from './logger';

const logger = createChildLogger('redis');

const redisOptions = env.REDIS_URL
  ? {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    }
  : {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
      lazyConnect: true,
    };

export const redisConnection = new IORedis(env.REDIS_URL || '', redisOptions as any);

redisConnection.on('connect', () => logger.info('Redis connected'));
redisConnection.on('error', (err) => logger.error({ err }, 'Redis connection error'));
