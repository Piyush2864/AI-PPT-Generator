import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className,
      )}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle theme"
    >
      <Sun
        className={cn(
          'h-4 w-4 transition-all duration-300 transform',
          isDark ? 'scale-0 rotate-90 opacity-0 absolute' : 'scale-100 rotate-0 opacity-100 text-amber-500',
        )}
      />
      <Moon
        className={cn(
          'h-4 w-4 transition-all duration-300 transform',
          isDark ? 'scale-100 rotate-0 opacity-100 text-cyan-400' : 'scale-0 -rotate-90 opacity-0 absolute',
        )}
      />
    </button>
  );
}
