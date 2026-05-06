import type { UseFormRegisterReturn } from 'react-hook-form';
import { Textarea } from '@/components/ui';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface JobDescriptionInputProps {
  charCount: number;
  error?: string;
  registration: UseFormRegisterReturn;
}

const MIN_CHARS = 100;
const MAX_CHARS = 15000;

export function JobDescriptionInput({
  charCount,
  error,
  registration,
}: JobDescriptionInputProps) {
  const isJdValid = charCount >= MIN_CHARS;

  return (
    <div>
      <Textarea
        label="Job Description"
        placeholder="Paste the full job description here..."
        className="min-h-[200px]"
        error={error}
        {...registration}
      />
      <div className="mt-1 flex items-center justify-between">
        <p
          className={`text-xs ${
            isJdValid
              ? 'text-green-600'
              : charCount > 0
              ? 'text-amber-600'
              : 'text-surface-400'
          }`}
        >
          {charCount > 0 && (
            <>
              {isJdValid ? (
                <CheckCircle2 className="mr-1 inline h-3 w-3" />
              ) : (
                <AlertCircle className="mr-1 inline h-3 w-3" />
              )}
              {charCount} / {MIN_CHARS} min characters
            </>
          )}
        </p>
        <p className="text-xs text-surface-400">
          Max {MAX_CHARS.toLocaleString()} characters
        </p>
      </div>
    </div>
  );
}
