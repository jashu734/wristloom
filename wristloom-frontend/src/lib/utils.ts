import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ─── Class Merging ────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Reference Number Generator ──────────────────────────────
export function generateRef(prefix: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// ─── Date Formatting ─────────────────────────────────────────
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  });
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

// ─── Currency Formatting ─────────────────────────────────────
export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Health Status Utilities ──────────────────────────────────
export type WatchHealthStatus =
  | 'Excellent'
  | 'Healthy'
  | 'Service Recommended'
  | 'Service Due'
  | 'Requires Attention';

export const healthStatusConfig: Record<
  WatchHealthStatus,
  { color: string; bg: string; dot: string; priority: number }
> = {
  Excellent: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/30',
    dot: 'bg-emerald-400',
    priority: 0,
  },
  Healthy: {
    color: 'text-sky-400',
    bg: 'bg-sky-400/10 border-sky-400/30',
    dot: 'bg-sky-400',
    priority: 1,
  },
  'Service Recommended': {
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/30',
    dot: 'bg-amber-400',
    priority: 2,
  },
  'Service Due': {
    color: 'text-orange-400',
    bg: 'bg-orange-400/10 border-orange-400/30',
    dot: 'bg-orange-400',
    priority: 3,
  },
  'Requires Attention': {
    color: 'text-red-400',
    bg: 'bg-red-400/10 border-red-400/30',
    dot: 'bg-red-400',
    priority: 4,
  },
};

// ─── String Utilities ────────────────────────────────────────
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trim() + '…';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ─── Misc ────────────────────────────────────────────────────
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? singular + 's');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
