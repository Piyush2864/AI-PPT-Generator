import { PresentationStatus } from '@prisma/client';
import { presentationRepository } from '../repositories/presentation.repository';
import { slideRepository } from '../repositories/slide.repository';
import { presentationQueue } from '../config/queue';
import { AppError } from '../utils/AppError';
import { createChildLogger } from '../config/logger';
import { JOB_EVENT_TYPE } from '../config/constants';
import type { CreatePresentationInput } from '../validators/presentation.validator';
import fs from 'fs';

const logger = createChildLogger('presentation-service');

export class PresentationService {
  // Creates the presentation record as PENDING and enqueues an async job.
  // Returns immediately with the job id - the actual AI generation happens
  // out-of-band in the worker process.
  async create(userId: string, input: CreatePresentationInput) {
    const presentation = await presentationRepository.create({
      topic: input.topic,
      audience: input.audience,
      language: input.language,
      slideCount: input.slideCount,
      theme: input.theme,
      tone: input.tone,
      style: input.style,
      customInstructions: input.customInstructions,
      status: PresentationStatus.PENDING,
      user: { connect: { id: userId } },
    });

    const job = await presentationQueue.add(
      'generate-presentation',
      {
        presentationId: presentation.id,
        userId,
        topic: input.topic,
        audience: input.audience,
        language: input.language,
        slideCount: input.slideCount,
        theme: input.theme,
        tone: input.tone,
        style: input.style,
        customInstructions: input.customInstructions,
      },
      { jobId: presentation.id }, // 1:1 mapping between presentation and job for easy lookup
    );

    await presentationRepository.attachJobId(presentation.id, job.id as string);
    await presentationRepository.addJobLog({
      presentationId: presentation.id,
      eventType: JOB_EVENT_TYPE.CREATED,
      message: `Job created and queued for presentation "${input.topic}"`,
    });

    logger.info({ presentationId: presentation.id, jobId: job.id, userId }, 'Presentation job created');

    return { ...presentation, jobId: job.id };
  }

  async getById(id: string, userId: string) {
    const presentation = await presentationRepository.findByIdAndUser(id, userId);
    if (!presentation) throw AppError.notFound('Presentation not found');
    return presentation;
  }

  async list(userId: string, page: number, limit: number, status?: PresentationStatus) {
    return presentationRepository.list({ userId, page, limit, status });
  }

  async delete(id: string, userId: string) {
    const presentation = await presentationRepository.findByIdAndUser(id, userId);
    if (!presentation) throw AppError.notFound('Presentation not found');

    // Clean up generated PDF file from disk if it exists, to avoid orphaned files.
    if (presentation.pdfUrl) {
      const absolutePath = `${process.cwd()}${presentation.pdfUrl}`;
      fs.promises.unlink(absolutePath).catch(() => {
        // Non-fatal: file may already be gone. Just log at debug level via service logger.
        logger.debug({ presentationId: id }, 'PDF file already absent during delete cleanup');
      });
    }

    await presentationRepository.delete(id);
    logger.info({ presentationId: id, userId }, 'Presentation deleted');
  }

  async regenerate(id: string, userId: string) {
    const presentation = await presentationRepository.findByIdAndUser(id, userId);
    if (!presentation) throw AppError.notFound('Presentation not found');

    // Only allow regeneration when previous attempt is fully settled (not mid-flight).
    if (
      presentation.status === PresentationStatus.PENDING ||
      presentation.status === PresentationStatus.PROCESSING
    ) {
      throw AppError.badRequest('Presentation is already being generated. Please wait for it to finish.');
    }

    // Delete old PDF from disk if it exists.
    if (presentation.pdfUrl) {
      const absolutePath = `${process.cwd()}${presentation.pdfUrl}`;
      fs.promises.unlink(absolutePath).catch(() => {
        logger.debug({ presentationId: id }, 'PDF file already absent during regenerate cleanup');
      });
    }

    // Wipe all previous slides so fresh ones don't collide on the unique (presentationId, order) index.
    await slideRepository.deleteAllByPresentation(id);

    // Reset all generation-related fields back to initial state.
    await presentationRepository.updateStatus(id, PresentationStatus.PENDING, {
      failureReason: null,
      startedAt: undefined,
      completedAt: undefined,
    });
    await presentationRepository.setPdfUrl(id, null as unknown as string);

    // Enqueue a brand new job. Use a unique jobId (timestamp suffix) because BullMQ
    // rejects a job whose id already exists in the queue/completed set.
    const newJobId = `${id}-${Date.now()}`;
    const job = await presentationQueue.add(
      'generate-presentation',
      {
        presentationId: id,
        userId,
        topic: presentation.topic,
        audience: presentation.audience,
        language: presentation.language,
        slideCount: presentation.slideCount,
        theme: presentation.theme,
        tone: presentation.tone,
        style: presentation.style,
        customInstructions: presentation.customInstructions ?? undefined,
      },
      { jobId: newJobId },
    );

    await presentationRepository.attachJobId(id, job.id as string);
    await presentationRepository.addJobLog({
      presentationId: id,
      eventType: JOB_EVENT_TYPE.CREATED,
      message: `Regeneration job created for presentation "${presentation.topic}"`,
    });

    logger.info({ presentationId: id, jobId: job.id, userId }, 'Presentation regeneration job created');

    return { id, jobId: job.id, status: PresentationStatus.PENDING };
  }

  async getJobLogs(id: string, userId: string) {
    const presentation = await presentationRepository.findByIdAndUser(id, userId);
    if (!presentation) throw AppError.notFound('Presentation not found');
    return presentationRepository.getJobLogs(id);
  }
}

export const presentationService = new PresentationService();
