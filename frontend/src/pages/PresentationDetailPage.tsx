import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Layers, Languages, Mic2, Palette, ListChecks, Loader2 } from 'lucide-react';
import { usePresentation, usePresentationJobLogs, useExportPresentation } from '../hooks/usePresentations';
import { presentationApi } from '../api/presentation.api';
import { PresentationStatusBadge } from '../components/presentation/PresentationStatusBadge';
import { SlidePreview } from '../components/presentation/SlidePreview';
import { JobLogTimeline } from '../components/presentation/JobLogTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import { useState } from 'react';

export function PresentationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: presentation, isLoading } = usePresentation(id);
  const { data: logs = [] } = usePresentationJobLogs(id);
  const exportMutation = useExportPresentation();

  const isCompleted = presentation?.status === 'COMPLETED';
  const isProcessing = presentation?.status === 'PROCESSING' || presentation?.status === 'PENDING';

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

        {isCompleted && (
          <Button
            size="lg"
            className="gap-1.5"
            onClick={handleExportAndDownload}
            isLoading={exportMutation.isPending || isDownloading}
          >
            <Download className="h-4 w-4" />
            Export as PDF
          </Button>
        )}
      </div>

      {/* Meta chips */}
      <div className="mt-5 flex flex-wrap gap-3">
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

      {/* Live progress banner */}
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
          <p className="text-sm font-medium text-danger">Generation failed after 3 automatic retry attempts</p>
          {presentation.failureReason && (
            <p className="mt-1 text-sm text-danger/80">{presentation.failureReason}</p>
          )}
        </Card>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Slides */}
        <div className="space-y-4 lg:col-span-2">
          <h2 className="text-sm font-semibold text-foreground">Slides</h2>
          {isCompleted && presentation.slides && presentation.slides.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {presentation.slides.map((s) => (
                <SlidePreview key={s.id} slide={s} theme={presentation.theme} />
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

        {/* Job logs */}
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
