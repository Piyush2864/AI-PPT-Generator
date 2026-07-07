import { z } from 'zod';

export const updateSlideSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid presentation id'),
    slideId: z.string().uuid('Invalid slide id'),
  }),
  body: z.object({
    title: z.string().min(1, 'Title cannot be empty').max(300).optional(),
    content: z.string().min(1, 'Content cannot be empty').max(5000).optional(),
    notes: z.string().max(2000).optional().nullable(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field (title, content, notes) is required' }
  ),
});

export const reorderSlidesSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid presentation id'),
  }),
  body: z.object({
    // Array of { slideId, order } pairs — user sends the new desired order
    slides: z
      .array(
        z.object({
          slideId: z.string().uuid('Invalid slide id'),
          order: z.number().int().min(1),
        })
      )
      .min(1, 'slides array cannot be empty'),
  }),
});

export type UpdateSlideInput = z.infer<typeof updateSlideSchema>['body'];
export type ReorderSlidesInput = z.infer<typeof reorderSlidesSchema>['body'];