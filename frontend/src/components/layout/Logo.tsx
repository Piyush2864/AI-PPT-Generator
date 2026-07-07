import { Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Sparkles className="h-4 w-4" />
      </div>
      <span className="text-[15px] font-bold tracking-tight">
        Slide<span className="text-primary">Forge</span>
      </span>
    </div>
  );
}
