import { slideRepository } from '../repositories/slide.repository';
import { presentationRepository } from '../repositories/presentation.repository';
import { AppError } from '../utils/AppError';
import { createChildLogger } from '../config/logger';
import type { UpdateSlideInput, ReorderSlidesInput } from '../validators/slide.validator';

const logger = createChildLogger('slide-service');

export class SlideService {

  private async assertOwnership(presentationId: string, userId: string, slideId?: string) {
    const presentation = await presentationRepository.findByIdAndUser(presentationId, userId);
    if (!presentation) throw AppError.notFound('Presentation not found');

    if (presentation.status !== 'COMPLETED') {
      throw AppError.badRequest('Slides can only be edited after generation is completed');
    }

    if (slideId) {
      const slide = await slideRepository.findByIdAndPresentation(slideId, presentationId);
      if (!slide) throw AppError.notFound('Slide not found');
      return { presentation, slide };
    }

    return { presentation };
  }

  async updateSlide(presentationId: string, slideId: string, userId: string, input: UpdateSlideInput) {
    await this.assertOwnership(presentationId, userId, slideId);

    const updated = await slideRepository.updateById(slideId, {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.content !== undefined && { content: input.content }),
      ...(input.notes !== undefined && { notes: input.notes }),
    });

    logger.info({ presentationId, slideId, userId }, 'Slide updated');
    return updated;
  }

  async reorderSlides(presentationId: string, userId: string, input: ReorderSlidesInput) {
    const { presentation } = await this.assertOwnership(presentationId, userId);

    const existingSlides = await slideRepository.findAllByPresentation(presentationId);
    const existingIds = new Set(existingSlides.map((s) => s.id));
    const requestIds = new Set(input.slides.map((s) => s.slideId));

    const hasInvalidIds = [...requestIds].some((id) => !existingIds.has(id));
    if (hasInvalidIds || requestIds.size !== existingIds.size) {
      throw AppError.badRequest('slides array must contain all slides of this presentation');
    }

    await slideRepository.reorder(input.slides);

    logger.info({ presentationId, userId, slideCount: input.slides.length }, 'Slides reordered');

    return slideRepository.findAllByPresentation(presentationId);
  }
}

export const slideService = new SlideService();