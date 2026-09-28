import * as React from 'react';
import { cn } from '@/lib/utils';

// ─── Empty State ──────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        'border border-dashed border-[rgba(176,141,87,0.15)] rounded-[4px]',
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-[rgba(176,141,87,0.40)]" aria-hidden>
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg text-[#EDE6D6] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[rgba(237,230,214,0.50)] max-w-sm">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// ─── Loading State ────────────────────────────────────────────
interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ message, className, size = 'md' }: LoadingStateProps) {
  const sizeMap = { sm: 'py-8', md: 'py-16', lg: 'py-24' };
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizeMap[size],
        className
      )}
      aria-live="polite"
      aria-busy="true"
    >
      <WatchSpinner />
      {message && (
        <p className="mt-4 text-sm text-[rgba(237,230,214,0.50)] font-mono tracking-wider">
          {message}
        </p>
      )}
    </div>
  );
}

// ─── Watch-inspired spinner ───────────────────────────────────
function WatchSpinner() {
  return (
    <div className="relative w-10 h-10" aria-hidden>
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border border-[rgba(176,141,87,0.20)]" />
      {/* Spinning arc */}
      <div className="absolute inset-0 rounded-full border border-transparent border-t-[#B08D57] animate-spin" />
      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-[#B08D57] opacity-60" />
      </div>
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────
interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We encountered an error. Please try again.',
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        'border border-dashed border-red-900/40 rounded-[4px]',
        className
      )}
      role="alert"
    >
      <div className="mb-4 w-10 h-10 rounded-full bg-red-900/20 flex items-center justify-center">
        <span className="text-red-400 text-lg" aria-hidden>!</span>
      </div>
      <h3 className="font-display text-lg text-[#EDE6D6] mb-2">{title}</h3>
      <p className="text-sm text-[rgba(237,230,214,0.50)] max-w-sm">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-[2px] bg-[rgba(237,230,214,0.06)]',
        className
      )}
      aria-hidden
    />
  );
}
