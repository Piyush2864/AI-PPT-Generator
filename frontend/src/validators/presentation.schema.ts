import { z } from 'zod';

export const createPresentationFormSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters').max(200),
  audience: z.string().min(2, 'Audience must be at least 2 characters').max(200),
  language: z.string().min(2).max(50),
  slideCount: z.number().int().min(1).max(10),
  theme: z.enum(['MINIMAL', 'CORPORATE', 'CREATIVE', 'DARK', 'ACADEMIC']),
  tone: z.enum(['FORMAL', 'CASUAL', 'INFORMATIVE', 'PERSUASIVE']),
  style: z.enum(['MINIMAL', 'PROFESSIONAL', 'CREATIVE', 'BOLD']),
  customInstructions: z.string().max(1000).optional(),
});

export type CreatePresentationFormValues = z.infer<typeof createPresentationFormSchema>;
