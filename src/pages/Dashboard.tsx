import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { resumeApi, analysisApi } from '@/lib/api';
import type { Resume, Analysis } from '@/types';
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
  FileText,
  TrendingUp,
  Target,
  Sparkles,
  Clock,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        const [resumeData, analysisData] = await Promise.all([
          resumeApi.getAll(user.id),
          analysisApi.getAll(user.id),
        ]);
        setResumes(resumeData);
        setAnalyses(analysisData);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoadingResumes(false);
        setIsLoadingAnalyses(false);
      }
    };
    loadData();
  }, [user]);

  const avgScore =
    analyses.length > 0
      ? Math.round(
          analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length
        )
      : 0;

  const recentAnalyses = analyses.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-surface-900">Dashboard</h2>
        <p className="mt-1 text-surface-500">
          Overview of your resume analysis activity
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-brand-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500">Total Resumes</p>
                <p className="mt-1 text-3xl font-bold text-surface-900">
                  {isLoadingResumes ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    resumes.length
                  )}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950">
                <FileText className="h-6 w-6 text-brand-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500">Analyses Done</p>
                <p className="mt-1 text-3xl font-bold text-surface-900">
                  {isLoadingAnalyses ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    analyses.length
                  )}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 dark:bg-green-950">
                <BarChart3 className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500">Avg. Score</p>
                <p className="mt-1 text-3xl font-bold text-surface-900">
                  {isLoadingAnalyses ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    `${avgScore}%`
                  )}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950">
                <TrendingUp className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500">Interviews Prep</p>
                <p className="mt-1 text-3xl font-bold text-surface-900">
                  {isLoadingAnalyses ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    analyses.length
                  )}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950">
                <Target className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload resume */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with these common tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start gap-3"
              variant="outline"
              size="lg"
              onClick={() => navigate('/settings')}
            >
              <FileText className="h-5 w-5 text-brand-500" />
              <span>Upload a new resume</span>
              <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
            <Button
              className="w-full justify-start gap-3"
              variant="outline"
              size="lg"
              onClick={() => navigate('/analyze')}
              disabled={resumes.length === 0}
            >
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span>Analyze a resume</span>
              <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
            <Button
              className="w-full justify-start gap-3"
              variant="outline"
              size="lg"
              onClick={() => navigate('/history')}
            >
              <Clock className="h-5 w-5 text-purple-500" />
              <span>View analysis history</span>
              <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Recent analyses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Analyses</CardTitle>
              <CardDescription>Your latest resume evaluations</CardDescription>
            </div>
            {analyses.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/history')}>
                View all
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoadingAnalyses ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentAnalyses.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-surface-500">
                  No analyses yet. Upload a resume and run your first analysis!
                </p>
                <Button
                  className="mt-4"
                  size="sm"
                  onClick={() => navigate('/settings')}
                >
                  Upload Resume
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAnalyses.map((analysis) => (
                  <Link
                    key={analysis.id}
                    to={`/analyze/${analysis.id}`}
                    className="flex items-center gap-4 rounded-lg border border-surface-200 p-3 transition-colors hover:bg-surface-50 dark:border-surface-300 dark:hover:bg-surface-100"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950">
                      <Sparkles className="h-5 w-5 text-brand-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-900 truncate">
                        {analysis.resumeNickname}
                      </p>
                      <p className="text-xs text-surface-500">
                        {formatDate(analysis.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        analysis.score >= 80
                          ? 'success'
                          : analysis.score >= 60
                          ? 'warning'
                          : 'destructive'
                      }
                    >
                      {analysis.score}%
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
