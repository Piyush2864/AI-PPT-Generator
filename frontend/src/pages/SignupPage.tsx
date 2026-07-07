import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Mail, Lock, User, ArrowRight, Check } from 'lucide-react';
import { Logo } from '../components/layout/Logo';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { useAuth } from '../context/AuthContext';
import { signupFormSchema } from '../validators/auth.schema';
import type { SignupFormValues } from '../validators/auth.schema';

const perks = ['AI-generated decks in seconds', 'Automatic retries — never click "retry" again', 'Live progress updates while you wait'];

export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupFormSchema) });

  const onSubmit = async (values: SignupFormValues) => {
    try {
      await signup(values);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || 'Could not create account');
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-foreground lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(21_90%_48%/0.35),transparent_55%)]" />
        <div className="relative flex h-full flex-col justify-center p-12">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Get started</p>
          <h2 className="mt-3 max-w-sm text-3xl font-bold leading-tight text-background">
            Build your first AI-generated deck today.
          </h2>
          <ul className="mt-8 space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-background/80">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-sm">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-in">
          <Logo className="mb-10" />

          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Free to start. No credit card required.</p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Label htmlFor="name">Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" placeholder="Piyush Sharma" className="pl-9" error={errors.name?.message} {...register('name')} />
              </div>
              {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
            </div>

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
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  className="pl-9"
                  error={errors.password?.message}
                  {...register('password')}
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full gap-1.5" size="lg" isLoading={isSubmitting}>
              Create account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
