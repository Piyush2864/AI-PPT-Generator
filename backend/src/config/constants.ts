export const QUEUE_NAMES = {
  PRESENTATION_GENERATION: 'presentation-generation',
} as const;

export const SOCKET_EVENTS = {
  PRESENTATION_STATUS_UPDATE: 'presentation:status_update',
} as const;

export const PRESENTATION_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export const JOB_EVENT_TYPE = {
  CREATED: 'CREATED',
  STARTED: 'STARTED',
  RETRY: 'RETRY',
  FAILED: 'FAILED',
  COMPLETED: 'COMPLETED',
} as const;
