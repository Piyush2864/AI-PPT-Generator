import { Link } from 'react-router-dom';
import { Globe2, Layers, Trash2, FileText, ImageOff } from 'lucide-react';
import type { Presentation } from '../../types/presentation.types';
import { PresentationStatusBadge } from './PresentationStatusBadge';
import { cn, formatRelativeTime } from '../../lib/utils';

const themeGradient: Record<string, string> = {
  MINIMAL:   'from-slate-100 to-slate-200',
  CORPORATE: 'from-blue-50 to-blue-100',
  CREATIVE:  'from-orange-50 to-orange-100',
  DARK:      'from-zinc-700 to-zinc-800',
  ACADEMIC:  'from-emerald-50 to-emerald-100',
};

const themeAccent: Record<string, string> = {
  MINIMAL:   'bg-slate-400',
  CORPORATE: 'bg-blue-600',
  CREATIVE:  'bg-orange-500',
  DARK:      'bg-cyan-400',
  ACADEMIC:  'bg-emerald-600',
};

const themeText: Record<string, string> = {
  MINIMAL:   'text-zinc-500',
  CORPORATE: 'text-blue-900',
  CREATIVE:  'text-orange-900',
  DARK:      'text-zinc-300',
  ACADEMIC:  'text-emerald-900',
};

export function PresentationCard({
  presentation,
  onDelete,
}: {
  presentation: Presentation;
  onDelete?: (id: string) => void;
}) {
  const coverImage = presentation.slides?.[0]?.imageUrl ?? null;

  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card shadow-card transition-shadow hover:shadow-md overflow-hidden">

      <Link to={`/presentations/${presentation.id}`} className="block">
        <div className={cn('relative h-36 w-full overflow-hidden', !coverImage && `bg-gradient-to-br ${themeGradient[presentation.theme]}`)}>

          <div className={cn('absolute top-0 left-0 right-0 h-1.5 z-10', themeAccent[presentation.theme])} />

          {coverImage ? (
            <img
              src={coverImage}
              alt={presentation.topic}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageOff className={cn('h-8 w-8 opacity-30', themeText[presentation.theme])} />
            </div>
          )}

          {coverImage && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          )}

          <div className="absolute right-3 top-4 z-10">
            <PresentationStatusBadge status={presentation.status} />
          </div>

          {coverImage && (
            <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
              <p className="text-sm font-semibold text-white line-clamp-1 drop-shadow">
                {presentation.topic}
              </p>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-col gap-2 p-4">
        {!coverImage && (
          <Link to={`/presentations/${presentation.id}`}>
            <h3 className="text-[15px] font-semibold leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {presentation.topic}
            </h3>
          </Link>
        )}

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
            <span className={cn('h-2 w-2 rounded-full', themeAccent[presentation.theme])} />
            {presentation.theme.toLowerCase()}
          </span>
        </div>

        {presentation.status === 'FAILED' && presentation.failureReason && (
          <p className="rounded-md bg-danger/5 px-2.5 py-1.5 text-xs text-danger line-clamp-1">
            {presentation.failureReason}
          </p>
        )}

        <div className="mt-1 flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(presentation.createdAt)}
          </span>
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
      </div>
    </div>
  );
}
