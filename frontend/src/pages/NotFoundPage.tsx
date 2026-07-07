import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
      <Link to="/dashboard">
        <Button className="mt-6">Back to dashboard</Button>
      </Link>
    </div>
  );
}
