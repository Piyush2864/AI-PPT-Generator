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
      { jobId: presentation.id }, 
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

  async duplicate(id: string, userId: string) {
    const original = await presentationRepository.findByIdAndUser(id, userId);
    if (!original) throw AppError.notFound('Presentation not found');

    
    const newPresentation = await presentationRepository.create({
      topic: `${original.topic} (Copy)`,
      audience: original.audience,
      language: original.language,
      slideCount: original.slideCount,
      theme: original.theme,
      tone: original.tone,
      style: original.style,
      customInstructions: original.customInstructions,
      status: PresentationStatus.PENDING,
      user: { connect: { id: userId } },
    });

    
    const job = await presentationQueue.add(
      'generate-presentation',
      {
        presentationId: newPresentation.id,
        userId,
        topic: newPresentation.topic,
        audience: newPresentation.audience,
        language: newPresentation.language,
        slideCount: newPresentation.slideCount,
        theme: newPresentation.theme,
        tone: newPresentation.tone,
        style: newPresentation.style,
        customInstructions: newPresentation.customInstructions ?? undefined,
      },
      { jobId: newPresentation.id },
    );

    await presentationRepository.attachJobId(newPresentation.id, job.id as string);
    await presentationRepository.addJobLog({
      presentationId: newPresentation.id,
      eventType: JOB_EVENT_TYPE.CREATED,
      message: `Duplicate job created from presentation "${original.topic}"`,
    });

    logger.info(
      { originalId: id, newPresentationId: newPresentation.id, jobId: job.id, userId },
      'Presentation duplicated',
    );

    return { ...newPresentation, jobId: job.id };
  }

  async regenerate(id: string, userId: string) {
    const presentation = await presentationRepository.findByIdAndUser(id, userId);
    if (!presentation) throw AppError.notFound('Presentation not found');

    
    if (
      presentation.status === PresentationStatus.PENDING ||
      presentation.status === PresentationStatus.PROCESSING
    ) {
      throw AppError.badRequest('Presentation is already being generated. Please wait for it to finish.');
    }

    
    if (presentation.pdfUrl) {
      const absolutePath = `${process.cwd()}${presentation.pdfUrl}`;
      fs.promises.unlink(absolutePath).catch(() => {
        logger.debug({ presentationId: id }, 'PDF file already absent during regenerate cleanup');
      });
    }

    
    await slideRepository.deleteAllByPresentation(id);

    
    await presentationRepository.updateStatus(id, PresentationStatus.PENDING, {
      failureReason: null,
      startedAt: undefined,
      completedAt: undefined,
    });
    await presentationRepository.setPdfUrl(id, null as unknown as string);

    
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
