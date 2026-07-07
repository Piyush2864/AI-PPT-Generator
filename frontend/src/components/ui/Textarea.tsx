import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[90px] w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
          'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none',
          error ? 'border-danger focus-visible:ring-danger' : 'border-border',
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';
