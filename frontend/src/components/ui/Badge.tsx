import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'muted';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning-foreground border-warning/30',
  danger: 'bg-danger/10 text-danger border-danger/20',
  muted: 'bg-muted text-muted-foreground border-border',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
