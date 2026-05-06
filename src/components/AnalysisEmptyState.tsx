import { Card, CardContent } from '@/components/ui';
import { Sparkles } from 'lucide-react';

export function AnalysisEmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <Sparkles className="mb-4 h-12 w-12 text-surface-300" />
        <p className="font-medium text-surface-500">
          Ready to analyze
        </p>
        <p className="mt-1 text-sm text-surface-400">
          Fill out the form and click &ldquo;Analyze Resume&rdquo; to get started
        </p>
      </CardContent>
    </Card>
  );
}
