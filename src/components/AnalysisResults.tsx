import type { Analysis } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '@/components/ui';
import {
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Target,
  Crosshair,
  TrendingUp,
  RefreshCw,
  Loader2,
} from 'lucide-react';

interface AnalysisResultsProps {
  result: Analysis;
  isUpdating?: boolean;
  onUpdateResume: () => void;
}

export function AnalysisResults({ result, isUpdating, onUpdateResume }: AnalysisResultsProps) {
  const hasSkills = (result.feedback.matchingSkills?.length ?? 0) > 0;
  const hasGaps = (result.feedback.skillGaps?.length ?? 0) > 0;
  const hasImprovements = (result.feedback.improvementRecommendations?.length ?? 0) > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Results</CardTitle>
          <Badge
            variant={
              result.score >= 80
                ? 'success'
                : result.score >= 60
                ? 'warning'
                : 'destructive'
            }
            className="text-base px-3 py-1"
          >
            {result.score}%
          </Badge>
        </div>
        <CardDescription>
          Analysis for &ldquo;{result.resumeNickname}&rdquo;
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
              {result.feedback.matchingSkills!.map((skill, i) => (
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
              {result.feedback.skillGaps!.map((gap, i) => (
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
            {result.feedback.strengths.map((s, i) => (
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
            {result.feedback.weaknesses.map((w, i) => (
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
            {result.feedback.suggestions.map((s, i) => (
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

        {/* Score Improvement Recommendations */}
        {hasImprovements && (
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-400">
              <TrendingUp className="h-4 w-4" />
              Score Improvement Tips
            </h4>
            <ul className="space-y-1.5">
              {result.feedback.improvementRecommendations!.map((rec, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-sm text-surface-600 dark:text-surface-400"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Update Resume Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={onUpdateResume}
          disabled={isUpdating}
          isLoading={isUpdating}
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Updating Resume...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-5 w-5" />
              Update Resume with Suggestions
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
