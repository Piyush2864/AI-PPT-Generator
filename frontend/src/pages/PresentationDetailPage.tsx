import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Download, Layers, Languages,
  Mic2, Palette, ListChecks, Loader2, RefreshCw, Copy, Pencil,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { usePresentation, usePresentationJobLogs, useExportPresentation } from '../hooks/usePresentations';
import { useUpdateSlide, useReorderSlides } from '../hooks/useSlides';
import { presentationApi } from '../api/presentation.api';
import { PresentationStatusBadge } from '../components/presentation/PresentationStatusBadge';
import { SlideEditorCard } from '../components/presentation/SlideEditorCard';
import { JobLogTimeline } from '../components/presentation/JobLogTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import type { Slide } from '../types/presentation.types';

export function PresentationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const { data: presentation, isLoading } = usePresentation(id);
  const { data: logs = [] } = usePresentationJobLogs(id);
  const exportMutation = useExportPresentation();
  const updateSlide = useUpdateSlide(id ?? '');
  const reorderSlides = useReorderSlides(id ?? '');

  const isCompleted = presentation?.status === 'COMPLETED';
  const isProcessing =
    presentation?.status === 'PROCESSING' || presentation?.status === 'PENDING';

  const slides: Slide[] = presentation?.slides ?? [];

 
  const handleSaveSlide = (
    slideId: string,
    payload: { title: string; content: string; notes: string },
  ) => {
    updateSlide.mutate({ slideId, payload });
  };

  const handleMove = (slide: Slide, direction: 'up' | 'down') => {
    const sorted = [...slides].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((s) => s.id === slide.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const newOrder = sorted.map((s, i) => {
      if (i === idx) return { slideId: s.id, order: sorted[swapIdx].order };
      if (i === swapIdx) return { slideId: s.id, order: sorted[idx].order };
      return { slideId: s.id, order: s.order };
    });

    reorderSlides.mutate(newOrder);
  };

  
  const handleExportAndDownload = async () => {
    if (!id || !presentation) return;
    try {
      await exportMutation.mutateAsync(id);
      setIsDownloading(true);
      await presentationApi.downloadPdf(id, presentation.topic);
    } catch {
      toast.error('PDF download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

 
  const handleRegenerate = async () => {
    if (!id) return;
    if (!confirm('Regenerate this presentation? Current slides will be replaced.')) return;
    setIsRegenerating(true);
    try {
      await presentationApi.regenerate(id);
      toast.success('Regeneration started');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to regenerate');
    } finally {
      setIsRegenerating(false);
    }
  };

  
  const handleDuplicate = async () => {
    if (!id) return;
    setIsDuplicating(true);
    try {
      const result = await presentationApi.duplicate(id);
      toast.success('Presentation duplicated!');
      navigate(`/presentations/${result.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to duplicate');
    } finally {
      setIsDuplicating(false);
    }
  };

  
  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!presentation) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <p className="text-sm text-muted-foreground">Presentation not found.</p>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>Back to dashboard</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl animate-fade-in">
     
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </button>

     
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{presentation.topic}</h1>
            <PresentationStatusBadge status={presentation.status} />
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">For {presentation.audience}</p>
        </div>

        
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleDuplicate}
            isLoading={isDuplicating}
          >
            <Copy className="h-4 w-4" />
            Duplicate
          </Button>

          {(isCompleted || presentation.status === 'FAILED') && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleRegenerate}
              isLoading={isRegenerating}
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </Button>
          )}

          {isCompleted && (
            <Button
              size="sm"
              className="gap-1.5"
              onClick={handleExportAndDownload}
              isLoading={exportMutation.isPending || isDownloading}
            >
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          )}
        </div>
      </div>

      
      <div className="mt-5 flex flex-wrap gap-2">
        {[
          { icon: <Layers className="h-3.5 w-3.5" />, label: `${presentation.slideCount} slides` },
          { icon: <Languages className="h-3.5 w-3.5" />, label: presentation.language },
          { icon: <Palette className="h-3.5 w-3.5" />, label: presentation.theme },
          { icon: <Mic2 className="h-3.5 w-3.5" />, label: presentation.tone },
          { icon: <ListChecks className="h-3.5 w-3.5" />, label: presentation.style },
        ].map((m) => (
          <span
            key={m.label}
            className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            {m.icon}
            {m.label.charAt(0) + m.label.slice(1).toLowerCase()}
          </span>
        ))}
      </div>

      
      {isProcessing && (
        <Card className="mt-6 border-warning/30 bg-warning/5 p-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-warning opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-warning" />
            </span>
            <p className="text-sm font-medium text-warning-foreground">
              Generating your slides… this updates live, no need to refresh.
            </p>
          </div>
        </Card>
      )}

     
      {presentation.status === 'FAILED' && (
        <Card className="mt-6 border-danger/30 bg-danger/5 p-4">
          <p className="text-sm font-medium text-danger">
            Generation failed after 3 automatic retry attempts
          </p>
          {presentation.failureReason && (
            <p className="mt-1 text-sm text-danger/80">{presentation.failureReason}</p>
          )}
        </Card>
      )}

     
      {isCompleted && slides.length > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
          <Pencil className="h-3.5 w-3.5 shrink-0 text-primary" />
          <p className="text-xs text-primary">
            Click <span className="font-semibold">Edit</span> on any slide to modify content, or use{' '}
            <span className="font-semibold">↑ ↓</span> arrows to reorder.
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        
        <div className="space-y-4 lg:col-span-2">
          <h2 className="text-sm font-semibold text-foreground">Slides</h2>

          {isCompleted && slides.length > 0 ? (
            <div className="space-y-4">
              {[...slides]
                .sort((a, b) => a.order - b.order)
                .map((slide) => (
                  <SlideEditorCard
                    key={slide.id}
                    slide={slide}
                    theme={presentation.theme}
                    totalSlides={slides.length}
                    isSaving={updateSlide.isPending}
                    onSave={handleSaveSlide}
                    onMoveUp={() => handleMove(slide, 'up')}
                    onMoveDown={() => handleMove(slide, 'down')}
                  />
                ))}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
              {isProcessing
                ? 'Slides will appear here once generation completes.'
                : presentation.status === 'FAILED'
                ? 'Generation failed — no slides were produced.'
                : 'Waiting to start…'}
            </div>
          )}
        </div>

        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Generation activity</CardTitle>
            </CardHeader>
            <CardContent>
              {logs.length > 0 ? (
                <JobLogTimeline logs={logs} />
              ) : (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
