import IORedis from 'ioredis';
import { env } from './env';
import { createChildLogger } from './logger';

const logger = createChildLogger('redis');

export const redisConnection = new IORedis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
});

redisConnection.on('connect', () => logger.info('Redis connected'));
redisConnection.on('error', (err) => logger.error({ err }, 'Redis connection error'));
