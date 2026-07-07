import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import path from 'path';
import { logger } from './config/logger';
import { env } from './config/env';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.middleware';
import { apiRateLimiter } from './middlewares/rateLimiter.middleware';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  
  app.use(
    pinoHttp({
      logger,
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
    }),
  );

  app.use(apiRateLimiter);

  
  app.use('/storage/exports', express.static(path.join(process.cwd(), 'storage', 'exports')));

  app.use('/api/v1', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
