import type { Slide } from '../../types/presentation.types';
import { Card } from '../ui/Card';
import { ImageOff } from 'lucide-react';

const themeConfig: Record<string, { bg: string; text: string; accent: string; overlay: string }> = {
  MINIMAL:   { bg: 'bg-white',     text: 'text-zinc-900', accent: 'bg-slate-400',   overlay: 'from-white/95' },
  CORPORATE: { bg: 'bg-slate-50',  text: 'text-slate-900', accent: 'bg-blue-600',   overlay: 'from-slate-50/95' },
  CREATIVE:  { bg: 'bg-orange-50', text: 'text-zinc-900',  accent: 'bg-orange-500', overlay: 'from-orange-50/95' },
  DARK:      { bg: 'bg-zinc-900',  text: 'text-zinc-50',   accent: 'bg-cyan-400',   overlay: 'from-zinc-900/95' },
  ACADEMIC:  { bg: 'bg-white',     text: 'text-zinc-900',  accent: 'bg-emerald-600', overlay: 'from-white/95' },
};

interface SlidePreviewProps {
  slide: Slide;
  theme?: string;
}

export function SlidePreview({ slide, theme = 'MINIMAL' }: SlidePreviewProps) {
  const cfg = themeConfig[theme] ?? themeConfig.MINIMAL;
  const hasImage = !!slide.imageUrl;

  return (
    <Card className="overflow-hidden p-0">
      <div className={`relative aspect-video ${cfg.bg} ${cfg.text}`}>
        
        <div className={`absolute left-0 top-0 h-1.5 w-full ${cfg.accent} z-10`} />

        {hasImage ? (
         
          <>
          
            <img
              src={slide.imageUrl!}
              alt={slide.title}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            
            <div className={`absolute inset-0 bg-gradient-to-r ${cfg.overlay} via-transparent to-transparent`} />

            
            <div className="relative z-10 flex h-full flex-col justify-center p-5 pt-7">
              <p className="text-[10px] font-medium uppercase tracking-wider opacity-50">
                Slide {slide.order}
              </p>
              <h3 className="mt-1 text-base font-bold leading-snug line-clamp-2 drop-shadow-sm">
                {slide.title}
              </h3>
              <div className="mt-2 space-y-0.5 text-xs leading-relaxed opacity-85 max-w-[55%]">
                {slide.content.split('\n').slice(0, 3).map((line, i) => (
                  <p key={i} className="line-clamp-1">{line}</p>
                ))}
              </div>
            </div>

            
            {slide.imagePhotographerName && (
              <div className="absolute bottom-2 right-3 z-10">
                <a
                  href={slide.imagePhotographerUrl ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] text-white/60 hover:text-white/90"
                >
                  📷 {slide.imagePhotographerName} / Unsplash
                </a>
              </div>
            )}
          </>
        ) : (
          
          <div className="relative flex h-full flex-col justify-center p-5 pt-7">
            <p className="text-[10px] font-medium uppercase tracking-wider opacity-50">
              Slide {slide.order}
            </p>
            <h3 className="mt-1 text-base font-bold leading-snug line-clamp-2">
              {slide.title}
            </h3>
            <div className="mt-2 space-y-1 text-xs leading-relaxed opacity-85">
              {slide.content.split('\n').slice(0, 4).map((line, i) => (
                <p key={i} className="line-clamp-2">{line}</p>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-1 text-[10px] opacity-30">
              <ImageOff className="h-3 w-3" />
              No image
            </div>
          </div>
        )}
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
