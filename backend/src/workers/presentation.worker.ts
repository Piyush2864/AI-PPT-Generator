import { Worker, Job, type ConnectionOptions } from 'bullmq';
import { redisConnection } from '../config/redis';
import { QUEUE_NAMES, JOB_EVENT_TYPE, PRESENTATION_STATUS } from '../config/constants';
import { PresentationJobData } from '../config/queue';
import { presentationRepository } from '../repositories/presentation.repository';
import { aiProviderService, AIProviderError } from '../services/aiProvider.service';
import { publishPresentationUpdate } from '../sockets/socket.bridge';
import { createChildLogger } from '../config/logger';
import { env } from '../config/env';
import { PresentationStatus } from '@prisma/client';

const logger = createChildLogger('presentation-worker');


const processor = async (job: Job<PresentationJobData>) => {
  const { presentationId, userId, topic, audience, language, slideCount, theme, tone, style, customInstructions } =
    job.data;
  const attempt = job.attemptsMade + 1; // attemptsMade is 0 on first try
  const startTime = Date.now();

  logger.info({ presentationId, jobId: job.id, attempt }, 'Worker started processing job');


  await presentationRepository.addJobLog({
    presentationId,
    eventType: attempt === 1 ? JOB_EVENT_TYPE.STARTED : JOB_EVENT_TYPE.RETRY,
    attempt,
    message: attempt === 1 ? 'Worker picked up job' : `Retry attempt ${attempt} after previous failure`,
  });

  await presentationRepository.updateStatus(presentationId, PresentationStatus.PROCESSING, {
    startedAt: new Date(),
  });

  await publishPresentationUpdate({
    userId,
    presentationId,
    status: PRESENTATION_STATUS.PROCESSING,
    progress: attempt === 1 ? 'Generating your slides…' : `Retrying (attempt ${attempt}/${env.JOB_MAX_ATTEMPTS})…`,
  });

  try {
    const slides = await aiProviderService.generateSlides({
      topic,
      audience,
      language,
      slideCount,
      theme,
      tone,
      style,
      customInstructions,
    });

    await presentationRepository.saveSlides(
      presentationId,
      slides.map((s) => ({ order: s.order, title: s.title, content: s.content, notes: s.notes })),
    );

    const durationMs = Date.now() - startTime;

    await presentationRepository.updateStatus(presentationId, PresentationStatus.COMPLETED, {
      completedAt: new Date(),
    });

    await presentationRepository.addJobLog({
      presentationId,
      eventType: JOB_EVENT_TYPE.COMPLETED,
      attempt,
      message: `Presentation generated successfully with ${slides.length} slides`,
      durationMs,
    });

    await publishPresentationUpdate({
      userId,
      presentationId,
      status: PRESENTATION_STATUS.COMPLETED,
      progress: 'Done!',
    });

    logger.info({ presentationId, jobId: job.id, durationMs }, 'Presentation generation completed');
    return { success: true, slideCount: slides.length };
  } catch (err) {
    const isAiError = err instanceof AIProviderError;
    const message = (err as Error).message;
    const willRetry = job.attemptsMade + 1 < (job.opts.attempts ?? env.JOB_MAX_ATTEMPTS) && (!isAiError || err.retryable);

    logger.error(
      { presentationId, jobId: job.id, attempt, willRetry, err: message },
      'Job attempt failed',
    );

    await presentationRepository.addJobLog({
      presentationId,
      eventType: JOB_EVENT_TYPE.FAILED,
      attempt,
      message: `Attempt ${attempt} failed: ${message}`,
      durationMs: Date.now() - startTime,
    });

    if (willRetry) {
      await publishPresentationUpdate({
        userId,
        presentationId,
        status: PRESENTATION_STATUS.PROCESSING,
        progress: `Attempt ${attempt} failed, retrying automatically…`,
      });
    }

    throw err;
  }
};

export const presentationWorker = new Worker<PresentationJobData>(
  QUEUE_NAMES.PRESENTATION_GENERATION,
  processor,
  {
    connection: redisConnection as unknown as ConnectionOptions,
    concurrency: 5,
  },
);


presentationWorker.on('failed', async (job, err) => {
  if (!job) return;
  const { presentationId, userId } = job.data;

  
  const attemptsExhausted = job.attemptsMade >= (job.opts.attempts ?? env.JOB_MAX_ATTEMPTS);
  if (!attemptsExhausted) return; 

  const failureReason = err?.message ?? 'Unknown error during presentation generation';

  await presentationRepository.updateStatus(presentationId, PresentationStatus.FAILED, {
    failureReason,
  });

  await publishPresentationUpdate({
    userId,
    presentationId,
    status: PRESENTATION_STATUS.FAILED,
    failureReason,
  });

  logger.error(
    { presentationId, jobId: job.id, attemptsMade: job.attemptsMade, failureReason },
    'Presentation generation permanently failed after exhausting all retry attempts',
  );
});

presentationWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'BullMQ job marked completed');
});

logger.info('Presentation generation worker started and listening for jobs');
