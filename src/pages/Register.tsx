import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { registerSchema, type RegisterFormValues } from '@/lib/validation';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { FileText } from 'lucide-react';

export function RegisterPage() {
  const { register: registerUser, isLoading, error, dismissError, isAuthenticated } = useAuth();
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
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      fullName: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    const success = await registerUser(data);
    if (success) {
      toast.success('Account created successfully!');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-surface-100 p-4 dark:from-brand-950 dark:via-surface-50 dark:to-surface-100">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 shadow-lg shadow-brand-500/25">
            <FileText className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900">ResumeForge</h1>
          <p className="mt-1 text-sm text-surface-500">
            Create your account
          </p>
        </div>

        <Card className="border-surface-200/50 bg-white/70 shadow-xl backdrop-blur-xl dark:bg-surface-50/70">
          <CardHeader>
            <CardTitle>Get started</CardTitle>
            <CardDescription>
              Create your account to start analyzing resumes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                label="Username"
                placeholder="johndoe"
                error={errors.username?.message}
                {...register('username')}
              />
              <Input
                label="Full Name"
                placeholder="John Doe"
                error={errors.fullName?.message}
                {...register('fullName')}
              />
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
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isSubmitting || isLoading}
              >
                Create Account
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-surface-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-brand-500 hover:text-brand-600"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
