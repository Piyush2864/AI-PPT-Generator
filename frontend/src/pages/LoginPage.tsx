import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Logo } from '../components/layout/Logo';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { loginFormSchema } from '../validators/auth.schema';
import type { LoginFormValues } from '../validators/auth.schema';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || 'Invalid email or password');
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-in">
          <Logo className="mb-10" />

          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Log in to continue generating presentations.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  className="pl-9"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs font-medium text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  error={errors.password?.message}
                  {...register('password')}
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full gap-1.5" size="lg" isLoading={isSubmitting}>
              Log in
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right: editorial panel */}
      <div className="relative hidden overflow-hidden bg-foreground lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(21_90%_48%/0.35),transparent_55%)]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div />
          <div className="max-w-md">
            <p className="text-2xl font-medium leading-snug text-background">
              "From a single topic to a polished, on-brand deck — in under a minute."
            </p>
            <p className="mt-4 text-sm text-background/60">
              Generated automatically. Retried silently. Delivered reliably.
            </p>
          </div>
          <Card className="border-background/10 bg-background/5 p-4 backdrop-blur-sm">
            <div className="space-y-2.5">
              {[
                { label: 'Quarterly Sales Review', status: 'Completed' },
                { label: 'Remote Work in 2026', status: 'Completed' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-background/90">{item.label}</span>
                  <span className="rounded-full bg-success/20 px-2 py-0.5 text-xs text-success">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
