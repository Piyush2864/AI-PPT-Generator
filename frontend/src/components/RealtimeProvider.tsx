import type { ReactNode } from 'react';
import { useRealtimePresentationUpdates } from '../hooks/useSocket';

export function RealtimeProvider({ children }: { children: ReactNode }) {
  useRealtimePresentationUpdates();
  return <>{children}</>;
}
