import { createRedisInstance } from '../config/redis';
import { emitPresentationUpdate } from './socket.server';
import { createChildLogger } from '../config/logger';

const logger = createChildLogger('socket-bridge');

const CHANNEL = 'presentation:updates';

export interface PresentationUpdateMessage {
  userId: string;
  presentationId: string;
  status: string;
  failureReason?: string | null;
  progress?: string;
}


export const subscribeToPresentationUpdates = () => {
  const subscriber = createRedisInstance();

  subscriber.subscribe(CHANNEL, (err) => {
    if (err) logger.error({ err }, 'Failed to subscribe to presentation updates channel');
    else logger.info('Subscribed to presentation updates channel');
  });

  subscriber.on('message', (_channel, message) => {
    try {
      const data: PresentationUpdateMessage = JSON.parse(message);
      emitPresentationUpdate(data.userId, data);
    } catch (err) {
      logger.error({ err }, 'Failed to parse presentation update message');
    }
  });

  return subscriber;
};

const publisher = createRedisInstance();

export const publishPresentationUpdate = async (message: PresentationUpdateMessage) => {
  await publisher.publish(CHANNEL, JSON.stringify(message));
};
