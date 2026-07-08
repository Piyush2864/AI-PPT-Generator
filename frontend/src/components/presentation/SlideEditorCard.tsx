import { useState } from 'react';
import { ChevronUp, ChevronDown, Pencil, X, Check } from 'lucide-react';
import type { Slide } from '../../types/presentation.types';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { cn } from '../../lib/utils';

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

interface SlideEditorCardProps {
  slide: Slide;
  theme?: string;
  totalSlides: number;
  isSaving: boolean;
  onSave: (slideId: string, payload: { title: string; content: string; notes: string }) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function SlideEditorCard({
  slide,
  theme = 'MINIMAL',
  totalSlides,
  isSaving,
  onSave,
  onMoveUp,
  onMoveDown,
}: SlideEditorCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(slide.title);
  const [content, setContent] = useState(slide.content);
  const [notes, setNotes] = useState(slide.notes ?? '');

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

  return (
    <div className={cn('rounded-xl border border-border overflow-hidden', isEditing && 'ring-2 ring-primary/30')}>
      {/* Slide preview header */}
      <div className={cn('relative aspect-video p-5', themeBg[theme])}>
        <div className={cn('absolute left-0 top-0 h-1.5 w-full', accentBar[theme])} />
        <p className="text-[10px] font-medium uppercase tracking-wider opacity-50">
          Slide {slide.order} of {totalSlides}
        </p>

        {!isEditing ? (
          <>
            <h3 className="mt-1 text-base font-bold leading-snug line-clamp-2">{slide.title}</h3>
            <div className="mt-2 space-y-1 text-xs leading-relaxed opacity-80">
              {slide.content.split('\n').map((line, i) => (
                <p key={i} className="line-clamp-2">{line}</p>
              ))}
            </div>
          </>
        ) : (
          
          <div className="mt-1 space-y-2">
            <input
              className="w-full rounded bg-white/80 px-2 py-1 text-sm font-bold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Slide title"
              maxLength={300}
            />
            <textarea
              className="w-full rounded bg-white/80 px-2 py-1 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Slide content (use new lines for bullet points)"
              maxLength={5000}
            />
          </div>
        )}
      </div>

      
      <div className="border-t border-border bg-card px-4 py-3">
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Speaker notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add speaker notes…"
                className="mt-1 min-h-[60px] text-xs"
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
          <div className="flex items-center justify-between gap-2">
            
            <p className="flex-1 truncate text-xs text-muted-foreground">
              {slide.notes ? (
                <>
                  <span className="font-medium text-foreground">Note: </span>
                  {slide.notes}
                </>
              ) : (
                <span className="italic">No speaker notes</span>
              )}
            </p>

           
            <div className="flex shrink-0 items-center gap-1">
              
              <button
                onClick={onMoveUp}
                disabled={slide.order === 1}
                title="Move up"
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                onClick={onMoveDown}
                disabled={slide.order === totalSlides}
                title="Move down"
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronDown className="h-4 w-4" />
              </button>

             
              <button
                onClick={() => setIsEditing(true)}
                title="Edit slide"
                className="flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-primary hover:bg-primary/10"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
