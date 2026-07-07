import { Queue, type ConnectionOptions } from 'bullmq';
import { redisConnection } from './redis';
import { env } from './env';
import { QUEUE_NAMES } from './constants';

export interface PresentationJobData {
  presentationId: string;
  userId: string;
  topic: string;
  audience: string;
  language: string;
  slideCount: number;
  theme: string;
  tone: string;
  style: string;
  customInstructions?: string;
}

export const presentationQueue = new Queue<PresentationJobData, unknown, string>(
  QUEUE_NAMES.PRESENTATION_GENERATION,
  {
    connection: redisConnection as unknown as ConnectionOptions,
    defaultJobOptions: {
      attempts: env.JOB_MAX_ATTEMPTS, 
      backoff: {
        type: 'exponential',
        delay: env.JOB_BACKOFF_DELAY_MS, 
      },
      removeOnComplete: { age: 60 * 60 * 24, count: 1000 }, 
      removeOnFail: { age: 60 * 60 * 24 * 7 }, 
    },
  },
);
