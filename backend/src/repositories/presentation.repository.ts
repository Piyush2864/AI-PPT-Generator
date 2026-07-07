import { Prisma, PresentationStatus } from '@prisma/client';
import { prisma } from '../config/prisma';

interface ListParams {
  userId: string;
  page: number;
  limit: number;
  status?: PresentationStatus;
}


export class PresentationRepository {
  create(data: Prisma.PresentationCreateInput) {
    return prisma.presentation.create({ data });
  }

  findById(id: string) {
    return prisma.presentation.findUnique({
      where: { id },
      include: { slides: { orderBy: { order: 'asc' } } },
    });
  }

  findByIdAndUser(id: string, userId: string) {
    return prisma.presentation.findFirst({
      where: { id, userId },
      include: { slides: { orderBy: { order: 'asc' } } },
    });
  }

  async list({ userId, page, limit, status }: ListParams) {
    const where: Prisma.PresentationWhereInput = { userId, ...(status ? { status } : {}) };

    const [items, total] = await Promise.all([
      prisma.presentation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.presentation.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  updateStatus(
    id: string,
    status: PresentationStatus,
    extra: Partial<{ failureReason: string | null; startedAt: Date; completedAt: Date }> = {},
  ) {
    return prisma.presentation.update({ where: { id }, data: { status, ...extra } });
  }

  attachJobId(id: string, jobId: string) {
    return prisma.presentation.update({ where: { id }, data: { jobId } });
  }

  setPdfUrl(id: string, pdfUrl: string) {
    return prisma.presentation.update({ where: { id }, data: { pdfUrl } });
  }

  delete(id: string) {
    return prisma.presentation.delete({ where: { id } });
  }

  saveSlides(presentationId: string, slides: { order: number; title: string; content: string; notes?: string }[]) {
    return prisma.$transaction(
      slides.map((slide) =>
        prisma.slide.create({
          data: { presentationId, ...slide },
        }),
      ),
    );
  }

  addJobLog(params: {
    presentationId: string;
    eventType: Prisma.JobLogCreateInput['eventType'];
    attempt?: number;
    message?: string;
    durationMs?: number;
  }) {
    return prisma.jobLog.create({
      data: {
        presentationId: params.presentationId,
        eventType: params.eventType,
        attempt: params.attempt ?? 1,
        message: params.message,
        durationMs: params.durationMs,
      },
    });
  }

  getJobLogs(presentationId: string) {
    return prisma.jobLog.findMany({
      where: { presentationId },
      orderBy: { createdAt: 'asc' },
    });
  }
}

export const presentationRepository = new PresentationRepository();
