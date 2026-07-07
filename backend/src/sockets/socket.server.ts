import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { env } from '../config/env';
import { verifyAccessToken } from '../utils/jwt';
import { createChildLogger } from '../config/logger';

const logger = createChildLogger('socket');

let io: SocketIOServer | null = null;


export const initSocketServer = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('Authentication token missing'));

    try {
      const decoded = verifyAccessToken(token);
      socket.data.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId as string;
    socket.join(`user:${userId}`);
    logger.info({ userId, socketId: socket.id }, 'Socket connected');

    socket.on('disconnect', () => {
      logger.info({ userId, socketId: socket.id }, 'Socket disconnected');
    });
  });

  return io;
};

export const getSocketServer = (): SocketIOServer => {
  if (!io) throw new Error('Socket.io server has not been initialized yet');
  return io;
};


export const emitPresentationUpdate = (
  userId: string,
  payload: { presentationId: string; status: string; failureReason?: string | null; progress?: string },
) => {
  if (!io) {
    logger.warn('Attempted to emit socket event before server initialized');
    return;
  }
  io.to(`user:${userId}`).emit('presentation:status_update', payload);
};
