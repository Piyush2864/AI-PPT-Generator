import type { Presentation, JobLog } from '../types/presentation.types';

export const mockUser = {
  id: 'u1',
  name: 'Piyush Sharma',
  email: 'piyush@example.com',
};

export const mockPresentations: Presentation[] = [
  {
    id: 'p1',
    topic: 'The Future of Remote Work',
    audience: 'HR leaders & executives',
    language: 'English',
    slideCount: 8,
    theme: 'CORPORATE',
    tone: 'PERSUASIVE',
    style: 'PROFESSIONAL',
    status: 'COMPLETED',
    pdfUrl: '/storage/exports/p1.pdf',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
  },
  {
    id: 'p2',
    topic: 'Intro to Generative AI for Marketing Teams',
    audience: 'Marketing managers',
    language: 'English',
    slideCount: 6,
    theme: 'CREATIVE',
    tone: 'CASUAL',
    style: 'CREATIVE',
    status: 'PROCESSING',
    createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 30).toISOString(),
  },
  {
    id: 'p3',
    topic: 'Quarterly Sales Review — Q2 2026',
    audience: 'Sales leadership',
    language: 'English',
    slideCount: 10,
    theme: 'MINIMAL',
    tone: 'FORMAL',
    style: 'MINIMAL',
    status: 'FAILED',
    failureReason: 'AI provider rate limit exceeded after 3 attempts',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
  },
  {
    id: 'p4',
    topic: 'Onboarding Guide for New Engineers',
    audience: 'New hires, junior devs',
    language: 'English',
    slideCount: 7,
    theme: 'ACADEMIC',
    tone: 'INFORMATIVE',
    style: 'PROFESSIONAL',
    status: 'COMPLETED',
    pdfUrl: '/storage/exports/p4.pdf',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: 'p5',
    topic: 'Why Investors Should Bet on Climate Tech',
    audience: 'Venture capital investors',
    language: 'English',
    slideCount: 9,
    theme: 'DARK',
    tone: 'PERSUASIVE',
    style: 'BOLD',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 1000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 10).toISOString(),
  },
];

export const mockSlides = [
  {
    id: 's1',
    order: 1,
    title: 'The Future of Remote Work',
    content:
      'An overview of how distributed teams are reshaping productivity, culture, and office real estate decisions through 2026 and beyond.',
    notes: 'Open with a striking stat about remote adoption growth.',
  },
  {
    id: 's2',
    order: 2,
    title: 'Why Hybrid Models Are Winning',
    content:
      'Hybrid schedules now outperform fully-remote and fully-office setups on retention.\nFlexibility is the #1 driver of candidate acceptance rates.\nReal estate costs have dropped 18% YoY for hybrid-first companies.',
    notes: 'Reference the Q1 retention survey if asked for sources.',
  },
  {
    id: 's3',
    order: 3,
    title: 'The Tools Powering Distributed Teams',
    content:
      'Async-first communication tools are replacing meeting-heavy workflows.\nAI copilots now handle scheduling, summaries, and follow-ups automatically.',
    notes: 'Good place for a live demo if presenting in person.',
  },
];

export const mockJobLogs: JobLog[] = [
  { id: 'l1', eventType: 'CREATED', attempt: 1, message: 'Job created and queued', createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: 'l2', eventType: 'STARTED', attempt: 1, message: 'Worker picked up job', createdAt: new Date(Date.now() - 1000 * 60 * 4.5).toISOString() },
  { id: 'l3', eventType: 'FAILED', attempt: 1, message: 'Attempt 1 failed: Gemini API rate limit exceeded', durationMs: 3200, createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString() },
  { id: 'l4', eventType: 'RETRY', attempt: 2, message: 'Retry attempt 2 after previous failure', createdAt: new Date(Date.now() - 1000 * 60 * 3.8).toISOString() },
  { id: 'l5', eventType: 'COMPLETED', attempt: 2, message: 'Presentation generated successfully with 8 slides', durationMs: 4100, createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString() },
];
