import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { analysisApi } from '@/lib/api';
import type { Analysis } from '@/types';
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
import {
  ArrowLeft,
  Brain,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Lightbulb,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

const difficultyColor = {
  easy: 'success' as const,
  medium: 'warning' as const,
  hard: 'destructive' as const,
};

export function InterviewPrepPage() {
  const { analysisId } = useParams<{ analysisId: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!analysisId) return;
    const loadAnalysis = async () => {
      try {
        const data = await analysisApi.getById(analysisId);
        setAnalysis(data);
      } catch {
        toast.error('Failed to load analysis');
      } finally {
        setIsLoading(false);
      }
    };
    loadAnalysis();
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
        <Link to="/history">
          <Button className="mt-4">Back to History</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link to="/history">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to History
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-surface-900">
          Interview Preparation
        </h2>
        <p className="mt-1 text-surface-500">
          For "{analysis.resumeNickname}" — Analyzed{' '}
          {formatDate(analysis.createdAt)}
        </p>
      </div>

      {/* Score card */}
      <Card>
        <CardContent className="flex items-center gap-6 p-6">
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold ${
              analysis.score >= 80
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : analysis.score >= 60
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            }`}
          >
            {analysis.score}%
          </div>
          <div>
            <p className="font-semibold text-surface-900">Match Score</p>
            <p className="text-sm text-surface-500">
              {analysis.score >= 80
                ? 'Strong match! You are well-aligned with this role.'
                : analysis.score >= 60
                ? 'Decent match. Some areas could be improved.'
                : 'Significant gaps identified. Review suggestions below.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Interview Questions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950">
              <Brain className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <CardTitle>Practice Interview Questions</CardTitle>
              <CardDescription>
                {analysis.interviewQuestions.length} questions generated based
                on your resume and the job description
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {analysis.interviewQuestions.map((q, index) => (
            <div
              key={index}
              className="rounded-lg border border-surface-200 dark:border-surface-300"
            >
              <button
                onClick={() =>
                  setExpandedIndex(
                    expandedIndex === index ? null : index
                  )
                }
                className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-surface-50 dark:hover:bg-surface-100"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-sm font-medium text-brand-600 dark:bg-brand-950 dark:text-brand-300">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 line-clamp-1">
                    {q.question}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant={difficultyColor[q.difficulty]}>
                      {q.difficulty}
                    </Badge>
                    <span className="text-xs text-surface-400">
                      {q.category}
                    </span>
                  </div>
                </div>
                {expandedIndex === index ? (
                  <ChevronUp className="h-5 w-5 shrink-0 text-surface-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 shrink-0 text-surface-400" />
                )}
              </button>
              {expandedIndex === index && (
                <div className="border-t border-surface-200 p-4 dark:border-surface-300">
                  <div className="flex gap-3">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium text-surface-700 dark:text-surface-300">
                        Preparation Tip
                      </p>
                      <p className="mt-1 text-sm text-surface-500">
                        Prepare a concise, structured response using the STAR
                        method (Situation, Task, Action, Result). Focus on
                        specific examples from your experience that demonstrate
                        your qualifications for this role.
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                          Practice Answer
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Feedback summary */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Summary</CardTitle>
          <CardDescription>
            Key insights from the analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="mb-2 text-sm font-semibold text-green-700 dark:text-green-400">
              Strengths
            </h4>
            <ul className="space-y-1">
              {analysis.feedback.strengths.map((s, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-sm text-surface-600 dark:text-surface-400"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
              Suggestions
            </h4>
            <ul className="space-y-1">
              {analysis.feedback.suggestions.map((s, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-sm text-surface-600 dark:text-surface-400"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
