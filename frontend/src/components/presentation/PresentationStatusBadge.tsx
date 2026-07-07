import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import type { PresentationStatus } from '../../types/presentation.types';
import { cn } from '../../lib/utils';

const config: Record<
  PresentationStatus,
  { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'muted'; icon: React.ReactNode }
> = {
  PENDING: { label: 'Pending', variant: 'muted', icon: <Clock className="h-3 w-3" /> },
  PROCESSING: { label: 'Processing', variant: 'warning', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  COMPLETED: { label: 'Completed', variant: 'success', icon: <CheckCircle2 className="h-3 w-3" /> },
  FAILED: { label: 'Failed', variant: 'danger', icon: <XCircle className="h-3 w-3" /> },
};

export function PresentationStatusBadge({ status, className }: { status: PresentationStatus; className?: string }) {
  const c = config[status];
  return (
    <Badge variant={c.variant} className={cn(className)}>
      {c.icon}
      {c.label}
    </Badge>
  );
}
