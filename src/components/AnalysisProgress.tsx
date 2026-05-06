import { cn } from '@/lib/utils';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';

export type StepStatus = 'pending' | 'in-progress' | 'done';

export interface AnalysisStep {
  id: string;
  label: string;
  description: string;
  status: StepStatus;
}

interface AnalysisProgressProps {
  steps: AnalysisStep[];
}

const statusConfig = {
  pending: {
    icon: Circle,
    color: 'text-surface-300 dark:text-surface-400',
    bg: 'bg-surface-100 dark:bg-surface-200',
    lineColor: 'bg-surface-200 dark:bg-surface-300',
  },
  'in-progress': {
    icon: Loader2,
    color: 'text-brand-500',
    bg: 'bg-brand-50 dark:bg-brand-950',
    lineColor: 'bg-brand-300',
  },
  done: {
    icon: CheckCircle2,
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-950',
    lineColor: 'bg-green-400',
  },
};

export function AnalysisProgress({ steps }: AnalysisProgressProps) {
  const doneCount = steps.filter((s) => s.status === 'done').length;
  const inProgressCount = steps.filter((s) => s.status === 'in-progress').length;
  const total = steps.length;

  return (
    <div className="space-y-5">
      {/* Progress summary bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="font-medium text-surface-700 dark:text-surface-300">
            Analysis Progress
          </span>
          <span className="text-surface-500">
            {doneCount + (inProgressCount > 0 ? 0 : 0)} / {total} steps
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-200 dark:bg-surface-300">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-green-500 transition-all duration-700 ease-out"
            style={{
              width: `${Math.round((doneCount / total) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Steps list */}
      <div className="space-y-0">
        {steps.map((step, index) => {
          const config = statusConfig[step.status];
          const Icon = config.icon;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="relative flex gap-4 pb-2">
              {/* Connector line */}
              {!isLast && (
                <div className="absolute left-[15px] top-8 flex h-full w-0.5">
                  <div
                    className={cn(
                      'h-full w-full transition-colors duration-500',
                      step.status === 'done'
                        ? 'bg-green-400'
                        : step.status === 'in-progress'
                        ? 'bg-brand-300'
                        : 'bg-surface-200 dark:bg-surface-300'
                    )}
                  />
                </div>
              )}

              {/* Icon */}
              <div
                className={cn(
                  'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-500',
                  config.bg
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 transition-all duration-500',
                    config.color,
                    step.status === 'in-progress' && 'animate-spin'
                  )}
                />
              </div>

              {/* Content */}
              <div className="flex-1 pb-4 min-w-0">
                <p
                  className={cn(
                    'text-sm font-medium transition-colors duration-300',
                    step.status === 'done' && 'text-green-700 dark:text-green-400',
                    step.status === 'in-progress' &&
                      'text-brand-700 dark:text-brand-300',
                    step.status === 'pending' &&
                      'text-surface-400 dark:text-surface-500'
                  )}
                >
                  {step.label}
                  {step.status === 'in-progress' && (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-brand-500">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />
                      In progress...
                    </span>
                  )}
                  {step.status === 'done' && (
                    <span className="ml-2 text-xs font-normal text-green-500">
                      ✓ Complete
                    </span>
                  )}
                </p>
                <p
                  className={cn(
                    'mt-0.5 text-xs transition-colors duration-300',
                    step.status === 'pending'
                      ? 'text-surface-300 dark:text-surface-500'
                      : 'text-surface-500 dark:text-surface-400'
                  )}
                >
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
