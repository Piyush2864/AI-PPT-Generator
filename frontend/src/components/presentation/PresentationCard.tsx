import { Link } from 'react-router-dom';
import { FileText, Globe2, Layers, Trash2 } from 'lucide-react';
import type { Presentation } from '../../types/presentation.types';
import { Card } from '../ui/Card';
import { PresentationStatusBadge } from './PresentationStatusBadge';
import { formatRelativeTime } from '../../lib/utils';

const themeDot: Record<string, string> = {
  MINIMAL: 'bg-slate-400',
  CORPORATE: 'bg-blue-500',
  CREATIVE: 'bg-orange-500',
  DARK: 'bg-zinc-700',
  ACADEMIC: 'bg-emerald-600',
};

export function PresentationCard({ presentation, onDelete }: { presentation: Presentation; onDelete?: (id: string) => void }) {
  return (
    <Card className="group relative flex flex-col gap-3 p-5 transition-shadow hover:shadow-card">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/presentations/${presentation.id}`} className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold leading-snug text-foreground group-hover:text-primary">
            {presentation.topic}
          </h3>
        </Link>
        <PresentationStatusBadge status={presentation.status} className="shrink-0" />
      </div>

      <p className="line-clamp-1 text-sm text-muted-foreground">For {presentation.audience}</p>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Layers className="h-3.5 w-3.5" />
          {presentation.slideCount} slides
        </span>
        <span className="flex items-center gap-1">
          <Globe2 className="h-3.5 w-3.5" />
          {presentation.language}
        </span>
        <span className="flex items-center gap-1">
          <span className={`h-2 w-2 rounded-full ${themeDot[presentation.theme]}`} />
          {presentation.theme.toLowerCase()}
        </span>
      </div>

      {presentation.status === 'FAILED' && presentation.failureReason && (
        <p className="rounded-md bg-danger/5 px-2.5 py-1.5 text-xs text-danger">{presentation.failureReason}</p>
      )}

      <div className="mt-1 flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs text-muted-foreground">{formatRelativeTime(presentation.createdAt)}</span>
        <div className="flex items-center gap-1">
          {presentation.status === 'COMPLETED' && (
            <Link
              to={`/presentations/${presentation.id}`}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
            >
              <FileText className="h-3.5 w-3.5" />
              View
            </Link>
          )}
          <button
            onClick={() => onDelete?.(presentation.id)}
            className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </Card>
  );
}
