import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analysisApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { Analysis } from '@/types';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Skeleton,
} from '@/components/ui';
import {
  Sparkles,
  Trash2,
  ExternalLink,
  BarChart3,
  Search,
  ArrowUpDown,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

type SortField = 'date' | 'score';
type SortOrder = 'asc' | 'desc';

export function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        const data = await analysisApi.getAll(user.id);
        setAnalyses(data);
      } catch {
        toast.error('Failed to load analysis history');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this analysis?')) return;
    try {
      await analysisApi.delete(id);
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      toast.success('Analysis deleted');
    } catch {
      toast.error('Failed to delete analysis');
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filtered = analyses
    .filter(
      (a) =>
        a.resumeNickname.toLowerCase().includes(search.toLowerCase()) ||
        a.jobDescription.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === 'date') {
        const cmp = a.createdAt.localeCompare(b.createdAt);
        return sortOrder === 'desc' ? -cmp : cmp;
      }
      return sortOrder === 'desc' ? b.score - a.score : a.score - b.score;
    });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">
            Analysis History
          </h2>
          <p className="mt-1 text-surface-500">
            View all your past resume analyses
          </p>
        </div>
        <Button onClick={() => navigate('/analyze')}>
          <Sparkles className="mr-2 h-4 w-4" />
          New Analysis
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
        <input
          type="text"
          placeholder="Search analyses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-lg border border-surface-300 bg-white pl-10 pr-4 text-sm text-surface-900 placeholder:text-surface-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:bg-surface-50 dark:text-surface-900"
        />
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-surface-400">Sort by:</span>
        <button
          onClick={() => toggleSort('date')}
          className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            sortField === 'date'
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
              : 'text-surface-500 hover:bg-surface-100'
          }`}
        >
          Date
          <ArrowUpDown className="h-3 w-3" />
        </button>
        <button
          onClick={() => toggleSort('score')}
          className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            sortField === 'score'
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
              : 'text-surface-500 hover:bg-surface-100'
          }`}
        >
          Score
          <ArrowUpDown className="h-3 w-3" />
        </button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16">
              <BarChart3 className="mb-4 h-12 w-12 text-surface-300" />
              <p className="font-medium text-surface-500">
                {search ? 'No matching analyses' : 'No analyses yet'}
              </p>
              <p className="mt-1 text-sm text-surface-400">
                {search
                  ? 'Try a different search term'
                  : 'Run your first analysis to see results here'}
              </p>
              {!search && (
                <Button
                  className="mt-4"
                  onClick={() => navigate('/analyze')}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze a Resume
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200 text-xs font-medium uppercase text-surface-400 dark:border-surface-300">
                    <th className="px-6 py-4 text-left">Resume</th>
                    <th className="px-6 py-4 text-left hidden md:table-cell">
                      Job Description
                    </th>
                    <th className="px-6 py-4 text-center">Score</th>
                    <th className="px-6 py-4 text-left hidden sm:table-cell">
                      Date
                    </th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200 dark:divide-surface-300">
                  {filtered.map((analysis) => (
                    <tr
                      key={analysis.id}
                      className="transition-colors hover:bg-surface-50 dark:hover:bg-surface-100"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950">
                            <Sparkles className="h-4 w-4 text-brand-500" />
                          </div>
                          <span className="text-sm font-medium text-surface-900">
                            {analysis.resumeNickname}
                          </span>
                        </div>
                      </td>
                      <td className="hidden px-6 py-4 md:table-cell">
                        <p className="max-w-xs truncate text-sm text-surface-500">
                          {analysis.jobDescription}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
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
                      </td>
                      <td className="hidden px-6 py-4 sm:table-cell">
                        <span className="text-sm text-surface-500">
                          {formatDate(analysis.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              navigate(
                                `/analyze/${analysis.id}`
                              )
                            }
                            aria-label="View analysis details"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(analysis.id)}
                            aria-label="Delete analysis"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
