import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { loginSchema, type LoginFormValues } from '@/lib/validation';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { FileText } from 'lucide-react';

export function LoginPage() {
  const { login, isLoading, error, dismissError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dismissError();
    }
  }, [error, dismissError]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    const success = await login(data);
    if (success) {
      toast.success('Welcome back!');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-surface-100 p-4 dark:from-brand-950 dark:via-surface-50 dark:to-surface-100">
      {/* Glassmorphic card */}
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 shadow-lg shadow-brand-500/25">
            <FileText className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900">ResumeForge</h1>
          <p className="mt-1 text-sm text-surface-500">
            Sign in to your account
          </p>
        </div>

        <Card className="border-surface-200/50 bg-white/70 shadow-xl backdrop-blur-xl dark:bg-surface-50/70">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isSubmitting || isLoading}
              >
                Sign In
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-surface-500">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-brand-500 hover:text-brand-600"
              >
                Create one
              </Link>
            </p>
            <div className="mt-4 rounded-lg bg-surface-100 p-3 dark:bg-surface-200">
              <p className="text-xs text-surface-500">
                <strong>Demo:</strong> demo@resumeforge.ai / Demo@1234
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
