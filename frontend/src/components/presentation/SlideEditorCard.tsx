import { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Pencil,
  X,
  Check,
  Sparkles,
  Zap,
  Maximize2,
  Briefcase,
  Mic,
  Globe,
  Loader2,
} from 'lucide-react';
import type { Slide } from '../../types/presentation.types';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { cn } from '../../lib/utils';

const themeConfig: Record<string, { bg: string; text: string; accent: string; muted: string }> = {
  MINIMAL:   { bg: 'bg-white',      text: 'text-zinc-900',  accent: 'bg-slate-400',   muted: 'text-zinc-400' },
  CORPORATE: { bg: 'bg-slate-50',   text: 'text-slate-900', accent: 'bg-blue-600',    muted: 'text-slate-400' },
  CREATIVE:  { bg: 'bg-orange-50',  text: 'text-zinc-900',  accent: 'bg-orange-500',  muted: 'text-orange-400' },
  DARK:      { bg: 'bg-zinc-900',   text: 'text-zinc-50',   accent: 'bg-cyan-400',    muted: 'text-zinc-500' },
  ACADEMIC:  { bg: 'bg-white',      text: 'text-zinc-900',  accent: 'bg-emerald-600', muted: 'text-zinc-400' },
};

const TRANSLATE_LANGUAGES = ['Spanish', 'French', 'German', 'Hindi', 'English'];

interface SlideEditorCardProps {
  slide: Slide;
  theme?: string;
  totalSlides: number;
  isSaving: boolean;
  isAiTransforming?: boolean;
  onSave: (slideId: string, payload: { title: string; content: string; notes: string }) => void;
  onAiTransform?: (
    slideId: string,
    action: 'CONCISE' | 'EXPAND' | 'FORMAL' | 'CASUAL' | 'TRANSLATE' | 'SPEAKER_NOTES',
    targetLanguage?: string,
  ) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function SlideEditorCard({
  slide,
  theme = 'MINIMAL',
  totalSlides,
  isSaving,
  isAiTransforming = false,
  onSave,
  onAiTransform,
  onMoveUp,
  onMoveDown,
}: SlideEditorCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showTranslateMenu, setShowTranslateMenu] = useState(false);
  const [title, setTitle] = useState(slide.title);
  const [content, setContent] = useState(slide.content);
  const [notes, setNotes] = useState(slide.notes ?? '');

  const cfg = themeConfig[theme] ?? themeConfig.MINIMAL;
  const hasImage = !!slide.imageUrl;

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    onSave(slide.id, { title: title.trim(), content: content.trim(), notes: notes.trim() });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(slide.title);
    setContent(slide.content);
    setNotes(slide.notes ?? '');
    setIsEditing(false);
  };

  const triggerAi = (
    action: 'CONCISE' | 'EXPAND' | 'FORMAL' | 'CASUAL' | 'TRANSLATE' | 'SPEAKER_NOTES',
    targetLanguage?: string,
  ) => {
    setShowTranslateMenu(false);
    onAiTransform?.(slide.id, action, targetLanguage);
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-border overflow-hidden shadow-card transition-all relative',
        isEditing && 'ring-2 ring-primary/30',
      )}
    >
      
      {isAiTransforming && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="mt-2 text-xs font-semibold text-primary">AI transforming slide…</p>
        </div>
      )}

      <div className={cn('relative', cfg.bg)}>
        <div className={cn('h-1.5 w-full', cfg.accent)} />

        {hasImage && !isEditing ? (
          
          <div className="flex min-h-[150px]">
            <div className="relative w-2/5 shrink-0 overflow-hidden">
              <img
                src={slide.imageUrl!}
                alt={slide.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className={cn('flex-1 p-4', cfg.text)}>
              <p className={cn('text-[10px] font-medium uppercase tracking-wider', cfg.muted)}>
                Slide {slide.order} of {totalSlides}
              </p>
              <h3 className="mt-1 text-sm font-bold leading-snug line-clamp-2">{slide.title}</h3>
              <div className="mt-2 space-y-0.5 text-xs leading-relaxed opacity-80">
                {slide.content.split('\n').slice(0, 4).map((line, i) => (
                  <p key={i} className="line-clamp-1">{line}</p>
                ))}
              </div>
            </div>
          </div>
        ) : !isEditing ? (
          
          <div className={cn('p-4 min-h-[120px]', cfg.text)}>
            <p className={cn('text-[10px] font-medium uppercase tracking-wider', cfg.muted)}>
              Slide {slide.order} of {totalSlides}
            </p>
            <h3 className="mt-1 text-sm font-bold leading-snug line-clamp-2">{slide.title}</h3>
            <div className="mt-2 space-y-0.5 text-xs leading-relaxed opacity-80">
              {slide.content.split('\n').slice(0, 4).map((line, i) => (
                <p key={i} className="line-clamp-2">{line}</p>
              ))}
            </div>
          </div>
        ) : (
          
          <div className={cn('p-4 space-y-2.5', cfg.text)}>
            <p className={cn('text-[10px] font-medium uppercase tracking-wider', cfg.muted)}>
              Editing Slide {slide.order}
            </p>
            <input
              className="w-full rounded-md border border-border bg-white/90 px-2.5 py-1.5 text-sm font-bold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Slide title"
              maxLength={300}
            />
            <textarea
              className="w-full rounded-md border border-border bg-white/90 px-2.5 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Slide content (use new lines for bullet points)"
              maxLength={5000}
            />
            {hasImage && (
              <img
                src={slide.imageUrl!}
                alt="Current image"
                className="h-16 w-full object-cover rounded-md opacity-50"
              />
            )}
          </div>
        )}
      </div>

      
      {!isEditing && onAiTransform && (
        <div className="border-t border-border/50 bg-muted/30 px-3 py-1.5 flex items-center justify-between gap-1 overflow-x-auto text-[11px]">
          <span className="flex items-center gap-1 font-semibold text-primary/80 shrink-0">
            <Sparkles className="h-3 w-3" />
            AI Assistant:
          </span>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => triggerAi('CONCISE')}
              className="flex items-center gap-1 rounded px-2 py-0.5 font-medium text-muted-foreground hover:bg-background hover:text-foreground border border-transparent hover:border-border transition-colors"
              title="Shorten and condense slide content"
            >
              <Zap className="h-3 w-3 text-amber-500" />
              Concise
            </button>

            <button
              onClick={() => triggerAi('EXPAND')}
              className="flex items-center gap-1 rounded px-2 py-0.5 font-medium text-muted-foreground hover:bg-background hover:text-foreground border border-transparent hover:border-border transition-colors"
              title="Expand with more detail and insights"
            >
              <Maximize2 className="h-3 w-3 text-blue-500" />
              Expand
            </button>

            <button
              onClick={() => triggerAi('FORMAL')}
              className="flex items-center gap-1 rounded px-2 py-0.5 font-medium text-muted-foreground hover:bg-background hover:text-foreground border border-transparent hover:border-border transition-colors"
              title="Rewrite in formal executive tone"
            >
              <Briefcase className="h-3 w-3 text-purple-500" />
              Formal
            </button>

            <button
              onClick={() => triggerAi('SPEAKER_NOTES')}
              className="flex items-center gap-1 rounded px-2 py-0.5 font-medium text-muted-foreground hover:bg-background hover:text-foreground border border-transparent hover:border-border transition-colors"
              title="Generate presenter speaker notes"
            >
              <Mic className="h-3 w-3 text-emerald-500" />
              Notes
            </button>

            <div className="relative">
              <button
                onClick={() => setShowTranslateMenu((v) => !v)}
                className="flex items-center gap-1 rounded px-2 py-0.5 font-medium text-muted-foreground hover:bg-background hover:text-foreground border border-transparent hover:border-border transition-colors"
                title="Translate slide"
              >
                <Globe className="h-3 w-3 text-teal-500" />
                Translate
              </button>

              {showTranslateMenu && (
                <div className="absolute right-0 bottom-full mb-1 z-30 w-28 rounded-md border border-border bg-popover py-1 shadow-lg text-popover-foreground animate-fade-in">
                  {TRANSLATE_LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => triggerAi('TRANSLATE', lang)}
                      className="w-full px-3 py-1 text-left text-xs hover:bg-muted font-medium"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      
      <div className="border-t border-border bg-card px-4 py-2.5">
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Speaker notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add speaker notes…"
                className="mt-1 min-h-[56px] text-xs"
                maxLength={2000}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                isLoading={isSaving}
                disabled={!title.trim() || !content.trim()}
                className="gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                Save slide
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancel} className="gap-1.5">
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={onMoveUp}
              disabled={slide.order === 1}
              title="Move up"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              onClick={onMoveDown}
              disabled={slide.order === totalSlides}
              title="Move down"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-primary hover:bg-primary/10"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
