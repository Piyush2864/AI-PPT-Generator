import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, LayoutGrid, Loader2 } from 'lucide-react';
import { usePresentationList, useDeletePresentation } from '../hooks/usePresentations';
import { PresentationCard } from '../components/presentation/PresentationCard';
import { Pagination } from '../components/ui/Pagination';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import type { PresentationStatus } from '../types/presentation.types';
import { cn } from '../lib/utils';

const ITEMS_PER_PAGE = 9;

const filters: { label: string; value: PresentationStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Failed', value: 'FAILED' },
];

export function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState<PresentationStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isFetching } = usePresentationList({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    status: activeFilter === 'ALL' ? undefined : activeFilter,
  });

  const deleteMutation = useDeletePresentation();

  const presentations = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalItems = data?.total ?? 0;

  const filtered = useMemo(
    () => presentations.filter((p) => p.topic.toLowerCase().includes(search.toLowerCase())),
    [presentations, search],
  );

  const stats = useMemo(
    () => ({
      total: totalItems,
      completed: presentations.filter((p) => p.status === 'COMPLETED').length,
      processing: presentations.filter((p) => p.status === 'PROCESSING' || p.status === 'PENDING').length,
      failed: presentations.filter((p) => p.status === 'FAILED').length,
    }),
    [presentations, totalItems],
  );

  const handleDelete = (id: string) => {
    if (confirm('Delete this presentation? This cannot be undone.')) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          if (filtered.length === 1 && currentPage > 1) {
            setCurrentPage((p) => p - 1);
          }
        },
      });
    }
  };

  const handleFilterChange = (value: PresentationStatus | 'ALL') => {
    setActiveFilter(value);
    setCurrentPage(1);
    setSearch('');
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your presentations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track generation status and manage your decks in one place.
          </p>
        </div>
        <Link to="/create">
          <Button size="lg" className="gap-1.5">
            <Plus className="h-4 w-4" />
            New presentation
          </Button>
        </Link>
      </div>

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total', value: stats.total, accent: 'text-foreground' },
          { label: 'Completed', value: stats.completed, accent: 'text-success' },
          { label: 'In progress', value: stats.processing, accent: 'text-warning-foreground' },
          { label: 'Failed', value: stats.failed, accent: 'text-danger' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
            <p className={cn('mt-1 text-2xl font-bold', s.accent)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => handleFilterChange(f.value)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                activeFilter === f.value
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search on this page…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="mt-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length > 0 ? (
        <>
          <div className={cn('mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3', isFetching && 'opacity-60 transition-opacity')}>
            {filtered.map((p) => (
              <PresentationCard key={p.id} presentation={p} onDelete={handleDelete} />
            ))}
          </div>

          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      ) : (
        <div className="mt-16 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <LayoutGrid className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">No presentations found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a different filter or create a new one.</p>
        </div>
      )}
    </div>
  );
}
