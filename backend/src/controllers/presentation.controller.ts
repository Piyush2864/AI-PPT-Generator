import { Response } from 'express';
import { PresentationStatus } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { presentationService } from '../services/presentation.service';
import { exportService } from '../services/export.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';

export const createPresentation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const presentation = await presentationService.create(req.user!.userId, req.body);
  sendSuccess(res, 202, 'Presentation generation job created', {
    id: presentation.id,
    jobId: presentation.jobId,
    status: presentation.status,
  });
});

export const listPresentations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page, limit, status } = req.query as unknown as {
    page: number;
    limit: number;
    status?: PresentationStatus;
  };
  const result = await presentationService.list(req.user!.userId, page, limit, status);
  sendSuccess(res, 200, 'Presentations fetched successfully', result);
});

export const getPresentation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const presentation = await presentationService.getById(req.params.id, req.user!.userId);
  sendSuccess(res, 200, 'Presentation fetched successfully', presentation);
});

export const deletePresentation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await presentationService.delete(req.params.id, req.user!.userId);
  sendSuccess(res, 200, 'Presentation deleted successfully');
});

export const getJobLogs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const logs = await presentationService.getJobLogs(req.params.id, req.user!.userId);
  sendSuccess(res, 200, 'Job logs fetched successfully', logs);
});

export const regeneratePresentation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await presentationService.regenerate(req.params.id, req.user!.userId);
  sendSuccess(res, 202, 'Presentation regeneration started', result);
});

export const duplicatePresentation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await presentationService.duplicate(req.params.id, req.user!.userId);
  sendSuccess(res, 202, 'Presentation duplicated successfully', {
    id: result.id,
    jobId: result.jobId,
    topic: result.topic,
    status: result.status,
  });
});


export const downloadPdf = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { buffer, filename } = await exportService.generatePdfBuffer(
    req.params.id,
    req.user!.userId,
  );

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Content-Length': buffer.length.toString(),
    'Cache-Control': 'no-store',
  });

  res.end(buffer);
});
