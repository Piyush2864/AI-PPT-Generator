import { z } from 'zod';

export const PRESENTATION_THEMES = ['MINIMAL', 'CORPORATE', 'CREATIVE', 'DARK', 'ACADEMIC'] as const;
export const PRESENTATION_TONES = ['FORMAL', 'CASUAL', 'INFORMATIVE', 'PERSUASIVE'] as const;
export const PRESENTATION_STYLES = ['MINIMAL', 'PROFESSIONAL', 'CREATIVE', 'BOLD'] as const;

export const createPresentationSchema = z.object({
  body: z.object({
    topic: z.string().min(3, 'Topic must be at least 3 characters').max(200),
    audience: z.string().min(2, 'Audience must be at least 2 characters').max(200),
    language: z.string().min(2).max(50).default('English'),
    slideCount: z
      .number({ invalid_type_error: 'slideCount must be a number' })
      .int()
      .min(1, 'Minimum 1 slide')
      .max(10, 'Maximum 10 slides'),
    theme: z.enum(PRESENTATION_THEMES).default('MINIMAL'),
    tone: z.enum(PRESENTATION_TONES).default('INFORMATIVE'),
    style: z.enum(PRESENTATION_STYLES).default('PROFESSIONAL'),
    customInstructions: z.string().max(1000, 'Max 1000 characters').optional(),
  }),
});

export const presentationIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid presentation id'),
  }),
});

export const listPresentationsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']).optional(),
  }),
});

export type CreatePresentationInput = z.infer<typeof createPresentationSchema>['body'];
