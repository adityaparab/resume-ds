import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { resumeSchema, type ResumeFormValues } from '@/lib/validation';
import { useAuth } from '@/hooks/useAuth';
import { resumeApi, openaiApi } from '@/lib/api';
import type { Resume } from '@/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Textarea,
  Badge,
  Skeleton,
} from '@/components/ui';
import {
  User,
  Plus,
  Trash2,
  FileText,
  Brain,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function SettingsPage() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user) return;
    const loadResumes = async () => {
      try {
        const data = await resumeApi.getAll(user.id);
        setResumes(data);
      } catch {
        toast.error('Failed to load resumes');
      } finally {
        setIsLoadingResumes(false);
      }
    };
    loadResumes();
  }, [user]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<ResumeFormValues>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      location: '',
      resumeNickname: '',
      resumeRawText: '',
    },
  });

  const onSubmit = async (data: ResumeFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      // Convert resume text to JSON Resume format via OpenAI
      const jsonResume = await openaiApi.convertToJsonResume(
        data.resumeRawText
      );

      // Merge bio data
      jsonResume.basics = {
        ...jsonResume.basics,
        name: data.fullName,
        email: data.email,
        phone: data.phone,
        location: {
          city: data.location.split(',')[0]?.trim() || data.location,
          region: data.location.split(',')[1]?.trim() || '',
        },
      };

      const resume = await resumeApi.create(user.id, data, jsonResume);
      setResumes((prev) => [resume, ...prev]);
      toast.success('Resume created successfully!');
      reset();
      setShowForm(false);
    } catch (err) {
      toast.error('Failed to create resume. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResume = async (id: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this resume? This cannot be undone.'
      )
    )
      return;
    try {
      await resumeApi.delete(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      toast.success('Resume deleted');
    } catch {
      toast.error('Failed to delete resume');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-surface-900">Settings</h2>
        <p className="mt-1 text-surface-500">
          Manage your profile and resumes
        </p>
      </div>

      {/* Profile section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950">
              <User className="h-5 w-5 text-brand-500" />
            </div>
            <div>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Your account information
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-surface-400">Full Name</p>
              <p className="text-sm font-medium text-surface-900">
                {user?.fullName || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-surface-400">Username</p>
              <p className="text-sm font-medium text-surface-900">
                {user?.username || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-surface-400">Email</p>
              <p className="text-sm font-medium text-surface-900">
                {user?.email || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-surface-400">Member Since</p>
              <p className="text-sm font-medium text-surface-900">
                {user?.createdAt ? formatDate(user.createdAt) : '—'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumes section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950">
              <FileText className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <CardTitle>My Resumes</CardTitle>
              <CardDescription>
                Manage your uploaded resumes ({resumes.length})
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            size="sm"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            {showForm ? 'Cancel' : 'Add Resume'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload form */}
          {showForm && (
            <Card className="border-2 border-dashed border-brand-300 bg-brand-50/30 dark:border-brand-700 dark:bg-brand-950/20">
              <CardContent className="p-5">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Full Name"
                      placeholder="John Doe"
                      error={errors.fullName?.message}
                      {...register('fullName')}
                    />
                    <Input
                      label="Phone"
                      placeholder="+1-555-0123"
                      error={errors.phone?.message}
                      {...register('phone')}
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="john@example.com"
                      error={errors.email?.message}
                      {...register('email')}
                    />
                    <Input
                      label="Location"
                      placeholder="San Francisco, CA"
                      error={errors.location?.message}
                      {...register('location')}
                    />
                  </div>
                  <Input
                    label="Resume Nickname"
                    placeholder="e.g., Primary Resume, Tech Jobs v2"
                    error={errors.resumeNickname?.message}
                    {...register('resumeNickname')}
                  />
                  <Textarea
                    label="Resume Content"
                    placeholder="Paste your full resume text here (at least 200 characters)..."
                    className="min-h-[200px]"
                    error={errors.resumeRawText?.message}
                    {...register('resumeRawText')}
                  />
                  <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    <p className="flex items-center gap-1.5 font-medium">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Privacy Notice
                    </p>
                    <p className="mt-1">
                      Your PII (name, email, phone, location) is stored
                      locally. Only the resume text content is sent to OpenAI
                      for analysis.
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    isLoading={isSubmitting || isFormSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Brain className="mr-2 h-4 w-4 animate-pulse" />
                        Processing with AI...
                      </>
                    ) : (
                      'Save Resume'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Resume list */}
          {isLoadingResumes ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : resumes.length === 0 && !showForm ? (
            <div className="flex flex-col items-center py-8">
              <FileText className="mb-3 h-10 w-10 text-surface-300" />
              <p className="text-sm text-surface-500">
                No resumes uploaded yet
              </p>
              <Button
                className="mt-3"
                size="sm"
                onClick={() => setShowForm(true)}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Upload Your First Resume
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="flex items-start gap-4 rounded-lg border border-surface-200 p-4 dark:border-surface-300"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950">
                    <FileText className="h-5 w-5 text-brand-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900">
                      {resume.resumeNickname}
                    </p>
                    <p className="text-xs text-surface-500">
                      {resume.fullName} · {resume.email}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-surface-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(resume.createdAt)}
                      </span>
                      <Badge variant="secondary">
                        {resume.resumeRawText.split(/\s+/).length} words
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteResume(resume.id)}
                    className="shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    aria-label={`Delete ${resume.resumeNickname}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
