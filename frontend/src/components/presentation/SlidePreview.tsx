import type { Slide } from '../../types/presentation.types';
import { Card } from '../ui/Card';

const themeBg: Record<string, string> = {
  MINIMAL: 'bg-white text-zinc-900',
  CORPORATE: 'bg-slate-50 text-slate-900',
  CREATIVE: 'bg-orange-50 text-zinc-900',
  DARK: 'bg-zinc-900 text-zinc-50',
  ACADEMIC: 'bg-white text-zinc-900',
};

const accentBar: Record<string, string> = {
  MINIMAL: 'bg-slate-400',
  CORPORATE: 'bg-blue-600',
  CREATIVE: 'bg-orange-500',
  DARK: 'bg-cyan-400',
  ACADEMIC: 'bg-emerald-600',
};

export function SlidePreview({ slide, theme = 'MINIMAL' }: { slide: Slide; theme?: string }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className={`relative aspect-video p-6 ${themeBg[theme]}`}>
        <div className={`absolute left-0 top-0 h-1.5 w-full ${accentBar[theme]}`} />
        <p className="text-[10px] font-medium uppercase tracking-wider opacity-50">Slide {slide.order}</p>
        <h3 className="mt-1 text-lg font-bold leading-snug">{slide.title}</h3>
        <div className="mt-3 space-y-1.5 text-sm leading-relaxed opacity-90">
          {slide.content.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>
      {slide.notes && (
        <div className="border-t border-border bg-muted/50 px-4 py-2.5">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Speaker note: </span>
            {slide.notes}
          </p>
        </div>
      )}
    </Card>
  );
}
