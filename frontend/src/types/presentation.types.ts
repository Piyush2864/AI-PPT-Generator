export type PresentationStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type PresentationTheme = 'MINIMAL' | 'CORPORATE' | 'CREATIVE' | 'DARK' | 'ACADEMIC';
export type PresentationTone = 'FORMAL' | 'CASUAL' | 'INFORMATIVE' | 'PERSUASIVE';
export type PresentationStyle = 'MINIMAL' | 'PROFESSIONAL' | 'CREATIVE' | 'BOLD';

export interface Slide {
  id: string;
  order: number;
  title: string;
  content: string;
  notes?: string;
}

export interface Presentation {
  id: string;
  topic: string;
  audience: string;
  language: string;
  slideCount: number;
  theme: PresentationTheme;
  tone: PresentationTone;
  style: PresentationStyle;
  customInstructions?: string;
  status: PresentationStatus;
  failureReason?: string | null;
  pdfUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  slides?: Slide[];
}

export interface JobLog {
  id: string;
  eventType: 'CREATED' | 'STARTED' | 'RETRY' | 'FAILED' | 'COMPLETED';
  attempt: number;
  message?: string;
  durationMs?: number;
  createdAt: string;
}
