import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | null | undefined): string {
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | null | undefined): string {
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncate(str: string, length: number = 100): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function calculateWeightagePercentage(current: number, total: number = 100): number {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}

export function isValidWeightage(weightage: number): boolean {
  return weightage >= 10 && weightage <= 100;
}

export function generateGoalCode(index: number): string {
  return `G-${String(index).padStart(3, '0')}`;
}
