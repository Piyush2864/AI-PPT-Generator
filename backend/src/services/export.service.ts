import { PresentationStatus } from '@prisma/client';
import { presentationRepository } from '../repositories/presentation.repository';
import { pdfExportService } from './pdfExport.service';
import { pptxExportService } from './pptxExport.service';
import { AppError } from '../utils/AppError';

export class ExportService {
  private async getCompletedPresentation(presentationId: string, userId: string) {
    const presentation = await presentationRepository.findByIdAndUser(presentationId, userId);
    if (!presentation) throw AppError.notFound('Presentation not found');

    if (presentation.status !== PresentationStatus.COMPLETED) {
      throw AppError.badRequest('Presentation must be completed before export');
    }

    if (!presentation.slides || presentation.slides.length === 0) {
      throw AppError.badRequest('Presentation has no slides to export');
    }

    return presentation;
  }

  async generatePdfBuffer(presentationId: string, userId: string): Promise<{ buffer: Buffer; filename: string }> {
    const presentation = await this.getCompletedPresentation(presentationId, userId);

    const buffer = await pdfExportService.generateBuffer(
      presentation.topic,
      presentation.theme,
      presentation.slides.map((s) => ({
        order: s.order,
        title: s.title,
        content: s.content,
        notes: s.notes,
        imageUrl: s.imageUrl,
      })),
    );

    const filename = `${presentation.topic.replace(/[^\w\s-]/g, '').trim()}.pdf`;

    return { buffer, filename };
  }

  async generatePptxBuffer(presentationId: string, userId: string): Promise<{ buffer: Buffer; filename: string }> {
    const presentation = await this.getCompletedPresentation(presentationId, userId);

    const buffer = await pptxExportService.generateBuffer(
      presentation.topic,
      presentation.theme,
      presentation.slides.map((s) => ({
        order: s.order,
        title: s.title,
        content: s.content,
        notes: s.notes,
        imageUrl: s.imageUrl,
      })),
    );

    const filename = `${presentation.topic.replace(/[^\w\s-]/g, '').trim()}.pptx`;

    return { buffer, filename };
  }
}

export const exportService = new ExportService();
