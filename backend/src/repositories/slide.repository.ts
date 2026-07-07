import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

export class SlideRepository {
  // Find a slide only if it belongs to the given presentation (ownership check)
  findByIdAndPresentation(slideId: string, presentationId: string) {
    return prisma.slide.findFirst({
      where: { id: slideId, presentationId },
    });
  }

  findAllByPresentation(presentationId: string) {
    return prisma.slide.findMany({
      where: { presentationId },
      orderBy: { order: 'asc' },
    });
  }

  updateById(slideId: string, data: Prisma.SlideUpdateInput) {
    return prisma.slide.update({ where: { id: slideId }, data });
  }

  // Reorder slides in a single transaction — atomically updates all order values
  // so there's no intermediate state with duplicate/missing order numbers.
  reorder(updates: { slideId: string; order: number }[]) {
    return prisma.$transaction(
      updates.map(({ slideId, order }) =>
        prisma.slide.update({ where: { id: slideId }, data: { order } })
      )
    );
  }

  // Wipes all slides for a presentation — used before regeneration so fresh
  // AI-generated slides don't collide with the unique (presentationId, order) constraint.
  deleteAllByPresentation(presentationId: string) {
    return prisma.slide.deleteMany({ where: { presentationId } });
  }
}

export const slideRepository = new SlideRepository();
