import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resumeApi, analysisApi } from '@/lib/api';
import type { Analysis, Resume } from '@/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Skeleton,
} from '@/components/ui';
import { ResumeDownloadDropdown } from '@/components/ResumeDownloadDropdown';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Target,
  Crosshair,
  TrendingUp,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export function AnalysisDetailPage() {
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!analysisId) return;
    const loadData = async () => {
      try {
        const analysisData = await analysisApi.getById(analysisId);
        setAnalysis(analysisData);

        // Also load the associated resume for download
        const resumeData = await resumeApi.getById(analysisData.resumeId);
        setResume(resumeData);
      } catch {
        toast.error('Failed to load analysis');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [analysisId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium text-surface-500">
          Analysis not found
        </p>
        <Button className="mt-4" onClick={() => navigate('/history')}>
          Back to History
        </Button>
      </div>
    );
  }

  const hasSkills = (analysis.feedback.matchingSkills?.length ?? 0) > 0;
  const hasGaps = (analysis.feedback.skillGaps?.length ?? 0) > 0;
  const hasImprovements =
    (analysis.feedback.improvementRecommendations?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/history')}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to History
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">
            Analysis Details
          </h2>
          <p className="mt-1 text-surface-500">
            For &ldquo;{analysis.resumeNickname}&rdquo; —{' '}
            {formatDate(analysis.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Download dropdown */}
          {resume && (
            <ResumeDownloadDropdown jsonResume={resume.jsonResume} />
          )}
          {/* Prepare for interview */}
          <Button
            onClick={() =>
              navigate(`/analyze/${analysis.id}/preparation`)
            }
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Prepare for Interview
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Main analysis results */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Results</CardTitle>
                <Badge
                  variant={
                    analysis.score >= 80
                      ? 'success'
                      : analysis.score >= 60
                      ? 'warning'
                      : 'destructive'
                  }
                  className="text-base px-3 py-1"
                >
                  {analysis.score}%
                </Badge>
              </div>
              <CardDescription>
                Match score analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Matching Skills */}
              {hasSkills && (
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400">
                    <Target className="h-4 w-4" />
                    Matching Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.feedback.matchingSkills!.map((skill, i) => (
                      <Badge key={i} variant="success" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Skill Gaps */}
              {hasGaps && (
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-400">
                    <Crosshair className="h-4 w-4" />
                    Skill Gaps
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.feedback.skillGaps!.map((gap, i) => (
                      <Badge key={i} variant="destructive" className="text-xs">
                        {gap}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths */}
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Strengths
                </h4>
                <ul className="space-y-1.5">
                  {analysis.feedback.strengths.map((s, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-sm text-surface-600 dark:text-surface-400"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  Areas to Improve
                </h4>
                <ul className="space-y-1.5">
                  {analysis.feedback.weaknesses.map((w, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-sm text-surface-600 dark:text-surface-400"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suggestions */}
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
                  <Lightbulb className="h-4 w-4" />
                  Suggestions
                </h4>
                <ul className="space-y-1.5">
                  {analysis.feedback.suggestions.map((s, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-sm text-surface-600 dark:text-surface-400"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Score Improvement Tips */}
              {hasImprovements && (
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-400">
                    <TrendingUp className="h-4 w-4" />
                    Score Improvement Tips
                  </h4>
                  <ul className="space-y-1.5">
                    {analysis.feedback.improvementRecommendations!.map(
                      (rec, i) => (
                        <li
                          key={i}
                          className="flex gap-2 text-sm text-surface-600 dark:text-surface-400"
                        >
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                          {rec}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - quick info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Job description snippet */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-surface-600 line-clamp-6">
                {analysis.jobDescription}
              </p>
              {analysis.jobDescription.length > 300 && (
                <p className="mt-2 text-xs text-surface-400">
                  {analysis.jobDescription.length} characters
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {resume && (
                <ResumeDownloadDropdown
                  jsonResume={resume.jsonResume}
                  label="Download Resume"
                />
              )}
              <Button
                className="w-full"
                onClick={() =>
                  navigate(`/analyze/${analysis.id}/preparation`)
                }
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Prepare for Interview
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/analyze')}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                New Analysis
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
