import type { PresentationTheme, PresentationTone, PresentationStyle } from './presentation.types';

export interface CreatePresentationPayload {
  topic: string;
  audience: string;
  language: string;
  slideCount: number;
  theme: PresentationTheme;
  tone: PresentationTone;
  style: PresentationStyle;
  customInstructions?: string;
}

export interface ListPresentationsParams {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}
