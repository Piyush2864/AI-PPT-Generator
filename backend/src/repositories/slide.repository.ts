import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

export class SlideRepository {
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

  reorder(updates: { slideId: string; order: number }[]) {
    return prisma.$transaction(
      updates.map(({ slideId, order }) =>
        prisma.slide.update({ where: { id: slideId }, data: { order } })
      )
    );
  }

  deleteAllByPresentation(presentationId: string) {
    return prisma.slide.deleteMany({ where: { presentationId } });
  }
}

export const slideRepository = new SlideRepository();
