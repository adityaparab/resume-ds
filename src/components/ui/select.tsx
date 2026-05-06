import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          className={cn(
            'flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-surface-900',
            'border-surface-300 dark:border-surface-400',
            'dark:bg-surface-50 dark:text-surface-900',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p
            id={`${selectId}-error`}
            className="mt-1 text-xs text-red-500"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Select };
