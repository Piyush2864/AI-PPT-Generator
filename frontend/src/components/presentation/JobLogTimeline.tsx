import type { JobLog } from '../../types/presentation.types';
import { cn } from '../../lib/utils';
import { CheckCircle2, PlayCircle, RotateCcw, XCircle, PlusCircle } from 'lucide-react';

const eventConfig: Record<JobLog['eventType'], { icon: React.ReactNode; color: string; label: string }> = {
  CREATED: { icon: <PlusCircle className="h-4 w-4" />, color: 'text-muted-foreground', label: 'Job created' },
  STARTED: { icon: <PlayCircle className="h-4 w-4" />, color: 'text-primary', label: 'Worker started' },
  RETRY: { icon: <RotateCcw className="h-4 w-4" />, color: 'text-warning-foreground', label: 'Retry attempt' },
  FAILED: { icon: <XCircle className="h-4 w-4" />, color: 'text-danger', label: 'Attempt failed' },
  COMPLETED: { icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-success', label: 'Completed' },
};

export function JobLogTimeline({ logs }: { logs: JobLog[] }) {
  return (
    <div className="space-y-0">
      {logs.map((log, idx) => {
        const cfg = eventConfig[log.eventType];
        const isLast = idx === logs.length - 1;
        return (
          <div key={log.id} className="relative flex gap-3 pb-5">
            {!isLast && <div className="absolute left-[15px] top-7 h-full w-px bg-border" />}
            <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted', cfg.color)}>
              {cfg.icon}
            </div>
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">{cfg.label}</p>
                <span className="text-xs text-muted-foreground">attempt {log.attempt}</span>
              </div>
              {log.message && <p className="mt-0.5 text-sm text-muted-foreground">{log.message}</p>}
              <p className="mt-1 text-xs text-muted-foreground/70">
                {new Date(log.createdAt).toLocaleTimeString()}
                {log.durationMs ? ` · ${(log.durationMs / 1000).toFixed(1)}s` : ''}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
