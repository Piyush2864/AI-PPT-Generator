import { cn } from '../../lib/utils';

interface Option {
  value: string;
  label: string;
  description?: string;
}

interface SegmentedControlProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  columns?: 2 | 4;
  keyPrefix?: string;
}

// A tactile pill-grid picker used for small, mutually-exclusive option sets
// (theme, tone, style). Feels more considered than a plain <select> for choices
// the user will compare visually before picking.
export function SegmentedControl({ options, value, onChange, columns = 4, keyPrefix = '' }: SegmentedControlProps) {
  return (
    <div className={cn('grid gap-2', columns === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2')}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={`${keyPrefix}-${opt.value}`}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-lg border px-3 py-2.5 text-left text-sm transition-all',
              active
                ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30'
                : 'border-border bg-card text-foreground hover:bg-muted',
            )}
          >
            <div className="font-medium">{opt.label}</div>
            {opt.description && (
              <div className={cn('mt-0.5 text-xs', active ? 'text-primary/70' : 'text-muted-foreground')}>
                {opt.description}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
