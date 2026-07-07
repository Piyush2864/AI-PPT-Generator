import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { initSocketServer } from './sockets/socket.server';
import { subscribeToPresentationUpdates } from './sockets/socket.bridge';
import { prisma } from './config/prisma';

const app = createApp();
const httpServer = http.createServer(app);


initSocketServer(httpServer);


const updateSubscriber = subscribeToPresentationUpdates();

httpServer.listen(env.PORT, () => {
  logger.info(`🚀 API server listening on port ${env.PORT} [${env.NODE_ENV}]`);
});

const shutdown = async (signal: string) => {
  logger.info(`${signal} received - shutting down gracefully`);
  httpServer.close();
  await updateSubscriber.quit();
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled promise rejection');
});
