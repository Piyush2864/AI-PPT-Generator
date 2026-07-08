import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);


  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (currentPage > 3) pages.push('...');

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push('...');

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      {/* Showing X - Y of Z */}
      <p className="text-sm text-muted-foreground">
        Showing{' '}
        <span className="font-medium text-foreground">{startItem}–{endItem}</span>
        {' '}of{' '}
        <span className="font-medium text-foreground">{totalItems}</span>{' '}
        presentations
      </p>

      {/* Page controls */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-md border border-border text-sm transition-colors',
            currentPage === 1
              ? 'cursor-not-allowed opacity-40'
              : 'hover:bg-muted',
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, idx) =>
          page === '...' ? (
            <span
              key={`ellipsis-${idx}`}
              className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors',
                currentPage === page
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:bg-muted',
              )}
            >
              {page}
            </button>
          ),
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-md border border-border text-sm transition-colors',
            currentPage === totalPages
              ? 'cursor-not-allowed opacity-40'
              : 'hover:bg-muted',
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
