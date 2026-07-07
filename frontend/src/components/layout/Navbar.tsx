import { LogOut, Plus } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const initials = (user?.name ?? '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/dashboard">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          <Link
            to="/dashboard"
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors',
              location.pathname === '/dashboard'
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/create">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              New presentation
            </Button>
          </Link>

          <div className="flex items-center gap-2 pl-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground"
              title={user?.email}
            >
              {initials}
            </div>
            <button
              onClick={handleLogout}
              className="hidden h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:flex"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
