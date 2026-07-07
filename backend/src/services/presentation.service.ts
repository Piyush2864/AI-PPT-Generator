import { PresentationStatus } from '@prisma/client';
import { presentationRepository } from '../repositories/presentation.repository';
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
        logger.debug({ presentationId: id }, 'PDF file already absent during delete cleanup');
      });
    }

    await presentationRepository.delete(id);
    logger.info({ presentationId: id, userId }, 'Presentation deleted');
  }

  async getJobLogs(id: string, userId: string) {
    const presentation = await presentationRepository.findByIdAndUser(id, userId);
    if (!presentation) throw AppError.notFound('Presentation not found');
    return presentationRepository.getJobLogs(id);
  }
}

export const presentationService = new PresentationService();
