import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS class names, resolving conflicts via tailwind-merge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string into a human-readable format.
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Truncates text to a specified length.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Generates a unique ID (simple implementation for demo).
 */
export function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Safely parses JSON with a fallback value.
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Delays execution (useful for simulating network requests).
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
