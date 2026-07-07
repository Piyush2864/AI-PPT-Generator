import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground',
          'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          error ? 'border-danger focus-visible:ring-danger' : 'border-border',
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';
