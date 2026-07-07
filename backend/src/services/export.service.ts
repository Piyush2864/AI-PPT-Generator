import { PresentationStatus } from '@prisma/client';
import { presentationRepository } from '../repositories/presentation.repository';
import { pdfExportService } from './pdfExport.service';
import { AppError } from '../utils/AppError';

export class ExportService {
  async exportToPdf(presentationId: string, userId: string): Promise<string> {
    const presentation = await presentationRepository.findByIdAndUser(presentationId, userId);
    if (!presentation) throw AppError.notFound('Presentation not found');

    if (presentation.status !== PresentationStatus.COMPLETED) {
      throw AppError.badRequest('Presentation must be completed before it can be exported');
    }

    if (presentation.pdfUrl) {
      return presentation.pdfUrl;
    }

    const pdfUrl = await pdfExportService.generate(
      presentation.id,
      presentation.topic,
      presentation.theme,
      presentation.slides.map((s) => ({ order: s.order, title: s.title, content: s.content, notes: s.notes })),
    );

    await presentationRepository.setPdfUrl(presentation.id, pdfUrl);
    return pdfUrl;
  }
}

export const exportService = new ExportService();
