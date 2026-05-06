import type { ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';

interface AnalysisFormCardProps {
  children: ReactNode;
}

export function AnalysisFormCard({ children }: AnalysisFormCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Details</CardTitle>
        <CardDescription>
          Select a resume and paste the job description
        </CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
