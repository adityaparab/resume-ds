import type { UseFormRegisterReturn } from 'react-hook-form';
import { Select, Skeleton } from '@/components/ui';
import type { Resume } from '@/types';

interface ResumeSelectorProps {
  isLoading: boolean;
  resumes: Resume[];
  error?: string;
  registration: UseFormRegisterReturn;
}

export function ResumeSelector({
  isLoading,
  resumes,
  error,
  registration,
}: ResumeSelectorProps) {
  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <Select
      label="Select Resume"
      placeholder="Choose a resume..."
      options={resumes.map((r) => ({
        value: r.id,
        label: r.resumeNickname,
      }))}
      error={error}
      {...registration}
    />
  );
}
