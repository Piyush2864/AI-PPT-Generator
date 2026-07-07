import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  CLIENT_URL: z.string().default('http://localhost:5173'),

  DATABASE_URL: z.string(),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional().default(''),

  JWT_ACCESS_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  AI_PROVIDER_API_KEY: z.string().optional().default(''),
  AI_PROVIDER_MODEL: z.string().optional().default('gemini-1.5-flash'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().default(20),

  JOB_MAX_ATTEMPTS: z.coerce.number().default(3),
  JOB_BACKOFF_DELAY_MS: z.coerce.number().default(2000),

  LOG_LEVEL: z.string().default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
