import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { analyzeSchema, type AnalyzeFormValues } from '@/lib/validation';
import { useAuth } from '@/hooks/useAuth';
import { resumeApi, analysisApi, openaiApi } from '@/lib/api';
import type { Resume, Analysis } from '@/types';
import {
  AnalysisFormCard,
  AnalysisProgress,
  AnalysisResults,
  AnalysisEmptyState,
  ResumeSelector,
  JobDescriptionInput,
  EmptyResumeWarning,
  type AnalysisStep,
} from '@/components';
import { ResumeExportDialog } from '@/components/ResumeExportDialog';
import { Card, CardContent, Button } from '@/components/ui';
import { Sparkles, Loader2 } from 'lucide-react';

export function AnalyzePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);
  const [analyzedResume, setAnalyzedResume] = useState<Resume | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const initialSteps: AnalysisStep[] = [
    {
      id: 'score',
      label: 'Matching Resume to Job Description',
      description: 'AI evaluates alignment between your experience and role requirements',
      status: 'pending',
    },
    {
      id: 'feedback',
      label: 'Generating Expert Feedback',
      description: 'Identifying strengths, gaps, and actionable improvements',
      status: 'pending',
    },
    {
      id: 'questions',
      label: 'Creating Interview Questions',
      description: 'Crafting tailored questions based on your unique profile',
      status: 'pending',
    },
  ];
  const [steps, setSteps] = useState<AnalysisStep[]>(initialSteps);

  const updateStepStatus = useCallback(
    (stepId: string, status: 'in-progress' | 'done') => {
      setSteps((prev) =>
        prev.map((s) => (s.id === stepId ? { ...s, status } : s))
      );
    },
    []
  );

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
    watch,
    formState: { errors, isValid },
  } = useForm<AnalyzeFormValues>({
    resolver: zodResolver(analyzeSchema),
    mode: 'onChange',
    defaultValues: {
      resumeId: '',
      jobDescription: '',
    },
  });

  const jobDescription = watch('jobDescription');
  watch('resumeId');
  const charCount = jobDescription?.length || 0;

  const onSubmit = async (data: AnalyzeFormValues) => {
    if (!user) return;
    setIsAnalyzing(true);
    setResult(null);
    setSteps(initialSteps.map((s) => ({ ...s, status: 'pending' as const })));

    try {
      const resume = resumes.find((r) => r.id === data.resumeId);
      if (!resume) {
        toast.error('Selected resume not found');
        setIsAnalyzing(false);
        return;
      }

      const analysisResult = await openaiApi.analyzeResume(
        resume.resumeRawText,
        data.jobDescription,
        (stepId, status) => updateStepStatus(stepId, status)
      );

      const analysis = await analysisApi.create(
        user.id,
        data.resumeId,
        resume.resumeNickname,
        data.jobDescription,
        analysisResult.score,
        analysisResult.feedback,
        analysisResult.interviewQuestions
      );

      setAnalyzedResume(resume);
      setResult(analysis);
      toast.success('Analysis complete!');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Analysis failed. Please try again.';
      toast.error(message);
      setSteps(initialSteps.map((s) => ({ ...s, status: 'pending' as const })));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateResume = async () => {
    if (!analyzedResume || !result) return;
    setIsUpdating(true);
    try {
      const updatedJsonResume = await openaiApi.updateResumeWithSuggestions(
        analyzedResume.jsonResume,
        result.feedback.suggestions
      );

      // Merge updated schema with existing resume and save to db
      const savedResume = await resumeApi.update(analyzedResume.id, {
        jsonResume: updatedJsonResume,
      });

      setAnalyzedResume(savedResume);
      toast.success('Resume updated successfully!');

      // Open export dialog
      setShowExportDialog(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update resume';
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-surface-900">
          Analyze Resume
        </h2>
        <p className="mt-1 text-surface-500">
          Get AI-powered insights on how your resume matches a job description
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Form section */}
        <div className="lg:col-span-3">
          <AnalysisFormCard>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <ResumeSelector
                isLoading={isLoadingResumes}
                resumes={resumes}
                error={errors.resumeId?.message}
                registration={register('resumeId')}
              />

              <JobDescriptionInput
                charCount={charCount}
                error={errors.jobDescription?.message}
                registration={register('jobDescription')}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={isAnalyzing}
                disabled={
                  !isValid || isLoadingResumes || resumes.length === 0 || isAnalyzing
                }
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Analyze Resume
                  </>
                )}
              </Button>
            </form>

            {resumes.length === 0 && !isLoadingResumes && (
              <EmptyResumeWarning onUploadClick={() => navigate('/settings')} />
            )}
          </AnalysisFormCard>
        </div>

        {/* Result section */}
        <div className="lg:col-span-2">
          {isAnalyzing ? (
            <Card>
              <CardContent className="p-6">
                <AnalysisProgress steps={steps} />
              </CardContent>
            </Card>
          ) : result ? (
            <AnalysisResults
              result={result}
              isUpdating={isUpdating}
              onUpdateResume={handleUpdateResume}
            />
          ) : (
            <AnalysisEmptyState />
          )}
        </div>
      </div>

      {showExportDialog && analyzedResume && (
        <ResumeExportDialog
          jsonResume={analyzedResume.jsonResume}
          onClose={() => setShowExportDialog(false)}
        />
      )}
    </div>
  );
}
