import { Response } from 'express';
import { PresentationStatus } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { presentationService } from '../services/presentation.service';
import { exportService } from '../services/export.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';
import path from 'path';

export const createPresentation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const presentation = await presentationService.create(userId, req.body);
  sendSuccess(res, 202, 'Presentation generation job created', {
    id: presentation.id,
    jobId: presentation.jobId,
    status: presentation.status,
  });
});

export const listPresentations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { page, limit, status } = req.query as unknown as {
    page: number;
    limit: number;
    status?: PresentationStatus;
  };
  const result = await presentationService.list(userId, page, limit, status);
  sendSuccess(res, 200, 'Presentations fetched successfully', result);
});

export const getPresentation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const presentation = await presentationService.getById(req.params.id, userId);
  console.log("nbksksdks ", presentation)
  sendSuccess(res, 200, 'Presentation fetched successfully', presentation);
});

export const deletePresentation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  await presentationService.delete(req.params.id, userId);
  sendSuccess(res, 200, 'Presentation deleted successfully');
});

export const getJobLogs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const logs = await presentationService.getJobLogs(req.params.id, userId);
  sendSuccess(res, 200, 'Job logs fetched successfully', logs);
});

export const exportPresentation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const pdfUrl = await exportService.exportToPdf(req.params.id, userId);
  sendSuccess(res, 200, 'PDF export ready', { pdfUrl });
});

export const downloadPdf = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const presentation = await presentationService.getById(req.params.id, userId);
  if (!presentation.pdfUrl) {
    throw AppError.badRequest('Presentation has not been exported yet');
  }
  const filename = path.basename(presentation.pdfUrl);
  const filepath = path.join(process.cwd(), 'storage', 'exports', filename);
  res.download(filepath, `${presentation.topic}.pdf`);
});
