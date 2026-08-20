import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Minimize2,
  FileText,
  HelpCircle,
} from 'lucide-react';
import type { Slide } from '../../types/presentation.types';
import { cn } from '../../lib/utils';

const themeStyles: Record<string, { bg: string; text: string; accent: string; muted: string; cardBg: string }> = {
  MINIMAL:   { bg: 'bg-zinc-900', cardBg: 'bg-white',      text: 'text-zinc-900',  accent: 'bg-slate-500',   muted: 'text-zinc-500' },
  CORPORATE: { bg: 'bg-slate-950', cardBg: 'bg-slate-50',   text: 'text-slate-900', accent: 'bg-blue-600',    muted: 'text-slate-500' },
  CREATIVE:  { bg: 'bg-stone-900', cardBg: 'bg-orange-50',  text: 'text-zinc-900',  accent: 'bg-orange-500',  muted: 'text-orange-600' },
  DARK:      { bg: 'bg-black',     cardBg: 'bg-zinc-900',   text: 'text-zinc-50',   accent: 'bg-cyan-400',    muted: 'text-zinc-400' },
  ACADEMIC:  { bg: 'bg-zinc-900', cardBg: 'bg-emerald-50/40', text: 'text-zinc-900', accent: 'bg-emerald-700', muted: 'text-emerald-800' },
};

interface PresenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  presentationTitle: string;
  slides: Slide[];
  theme?: string;
}

export function PresenterModal({
  isOpen,
  onClose,
  presentationTitle,
  slides,
  theme = 'MINIMAL',
}: PresenterModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const sortedSlides = [...slides].sort((a, b) => a.order - b.order);
  const currentSlide = sortedSlides[currentIndex];

  const cfg = themeStyles[theme] ?? themeStyles.MINIMAL;

  const nextSlide = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, sortedSlides.length - 1));
  }, [sortedSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'n' || e.key === 'N') {
        setShowNotes((v) => !v);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'Escape' && !document.fullscreenElement) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextSlide, prevSlide, toggleFullscreen, onClose]);

  if (!isOpen || !currentSlide) return null;

  const paragraphs = currentSlide.content.split('\n').filter(Boolean);

  return (
    <div
      ref={containerRef}
      className={cn(
        'fixed inset-0 z-50 flex flex-col justify-between overflow-hidden select-none animate-fade-in',
        cfg.bg,
      )}
    >
      
      <div className="flex items-center justify-between px-6 py-4 bg-black/40 text-white/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="text-sm font-semibold tracking-wide truncate max-w-md">
            {presentationTitle}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShortcuts((v) => !v)}
            title="Keyboard shortcuts"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={onClose}
            title="Exit Presenter Mode (Esc)"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden">
        <div
          className={cn(
            'relative w-full max-w-5xl aspect-[16/9] rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col justify-between transition-all duration-300',
            cfg.cardBg,
            cfg.text,
          )}
        >
          
          <div className={cn('h-2 w-full shrink-0', cfg.accent)} />

          
          <div className="flex-1 p-8 sm:p-12 flex flex-col justify-between overflow-y-auto">
            
            <div className="flex items-center justify-between">
              <span className={cn('text-xs font-bold uppercase tracking-widest', cfg.muted)}>
                SLIDE {currentSlide.order} OF {sortedSlides.length}
              </span>
              <span className={cn('text-xs font-medium', cfg.muted)}>{presentationTitle}</span>
            </div>

            
            <div className="my-auto py-4">
              {currentSlide.imageUrl ? (
                <div className="grid gap-8 sm:grid-cols-2 items-center">
                  <div>
                    <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight tracking-tight">
                      {currentSlide.title}
                    </h1>
                    <div className="mt-6 space-y-3">
                      {paragraphs.map((p, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          {paragraphs.length > 1 && (
                            <span className={cn('mt-2 h-1.5 w-1.5 shrink-0 rounded-full', cfg.accent)} />
                          )}
                          <p className="text-base sm:text-lg leading-relaxed opacity-90">{p}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg border border-black/10">
                    <img
                      src={currentSlide.imageUrl}
                      alt={currentSlide.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl">
                  <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight">
                    {currentSlide.title}
                  </h1>
                  <div className="mt-8 space-y-4">
                    {paragraphs.map((p, idx) => (
                      <div key={idx} className="flex items-start gap-4">
                        {paragraphs.length > 1 && (
                          <span className={cn('mt-2.5 h-2 w-2 shrink-0 rounded-full', cfg.accent)} />
                        )}
                        <p className="text-lg sm:text-2xl leading-relaxed font-normal opacity-90">{p}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            
            <div className="flex items-center justify-between text-xs opacity-40 border-t border-current/10 pt-3">
              <span>AI-PPT Presentation Engine</span>
              <span>{currentIndex + 1}</span>
            </div>
          </div>
        </div>
      </div>

      
      {showNotes && (
        <div className="mx-auto max-w-4xl w-full px-6 mb-3 animate-fade-in">
          <div className="rounded-xl border border-white/20 bg-black/80 p-4 text-white backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <FileText className="h-3.5 w-3.5" />
                SPEAKER NOTES (SLIDE {currentSlide.order})
              </span>
              <button
                onClick={() => setShowNotes(false)}
                className="text-white/60 hover:text-white text-xs"
              >
                Close (N)
              </button>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-zinc-200">
              {currentSlide.notes || 'No speaker notes for this slide.'}
            </p>
          </div>
        </div>
      )}

      
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-white/20 bg-zinc-900 p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold">Keyboard Shortcuts</h3>
              <button onClick={() => setShowShortcuts(false)} className="text-white/60 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-2.5 text-xs">
              {[
                { key: '→ / Space / PgDown', desc: 'Next slide' },
                { key: '← / PgUp', desc: 'Previous slide' },
                { key: 'N', desc: 'Toggle Speaker Notes' },
                { key: 'F', desc: 'Toggle Fullscreen Mode' },
                { key: 'Esc', desc: 'Exit Presenter Mode' },
              ].map((item) => (
                <div key={item.key} className="flex justify-between items-center py-1">
                  <span className="rounded bg-white/10 px-2 py-1 font-mono text-amber-400">
                    {item.key}
                  </span>
                  <span className="text-zinc-300">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      
      <div className="flex items-center justify-between px-6 py-4 bg-black/60 text-white backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotes((v) => !v)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              showNotes ? 'bg-amber-500 text-black' : 'bg-white/10 text-white/80 hover:bg-white/20',
            )}
          >
            <FileText className="h-3.5 w-3.5" />
            Notes (N)
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <span className="text-xs font-medium tracking-wider text-white/80">
            {currentIndex + 1} / {sortedSlides.length}
          </span>

          <button
            onClick={nextSlide}
            disabled={currentIndex === sortedSlides.length - 1}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
