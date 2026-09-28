import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ─── Badge Variants ───────────────────────────────────────────
const badgeVariants = cva(
  'inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase font-medium border rounded-[2px] px-2 py-0.5 whitespace-nowrap',
  {
    variants: {
      variant: {
        // Watch Health Statuses
        excellent:
          'bg-emerald-400/10 text-emerald-400 border-emerald-400/30',
        healthy:
          'bg-sky-400/10 text-sky-400 border-sky-400/30',
        'service-recommended':
          'bg-amber-400/10 text-amber-400 border-amber-400/30',
        'service-due':
          'bg-orange-400/10 text-orange-400 border-orange-400/30',
        'requires-attention':
          'bg-red-400/10 text-red-400 border-red-400/30',
        // General badges
        brass:
          'bg-[rgba(176,141,87,0.10)] text-[#B08D57] border-[rgba(176,141,87,0.30)]',
        oxblood:
          'bg-[rgba(107,39,55,0.20)] text-[#E8A0B0] border-[rgba(107,39,55,0.40)]',
        neutral:
          'bg-[rgba(237,230,214,0.06)] text-[rgba(237,230,214,0.55)] border-[rgba(237,230,214,0.12)]',
        'new-arrival':
          'bg-[rgba(176,141,87,0.15)] text-[#B08D57] border-[rgba(176,141,87,0.35)]',
        certified:
          'bg-emerald-900/30 text-emerald-400 border-emerald-700/40',
        // Status
        available:
          'bg-emerald-400/10 text-emerald-400 border-emerald-400/30',
        limited:
          'bg-amber-400/10 text-amber-400 border-amber-400/30',
        'coming-soon':
          'bg-[rgba(237,230,214,0.06)] text-[rgba(237,230,214,0.45)] border-[rgba(237,230,214,0.12)]',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, dot, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, className }))}
        {...props}
      >
        {dot && (
          <span
            className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', getDotColor(variant))}
            aria-hidden
          />
        )}
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';

function getDotColor(
  variant: VariantProps<typeof badgeVariants>['variant']
): string {
  const map: Record<string, string> = {
    excellent: 'bg-emerald-400',
    healthy: 'bg-sky-400',
    'service-recommended': 'bg-amber-400',
    'service-due': 'bg-orange-400',
    'requires-attention': 'bg-red-400',
    available: 'bg-emerald-400',
    limited: 'bg-amber-400',
    brass: 'bg-[#B08D57]',
    certified: 'bg-emerald-400',
  };
  return map[variant as string] ?? 'bg-[rgba(237,230,214,0.45)]';
}

// ─── Health Badge (specific utility) ─────────────────────────
type HealthStatus =
  | 'Excellent'
  | 'Healthy'
  | 'Service Recommended'
  | 'Service Due'
  | 'Requires Attention';

const healthVariantMap: Record<HealthStatus, VariantProps<typeof badgeVariants>['variant']> = {
  Excellent: 'excellent',
  Healthy: 'healthy',
  'Service Recommended': 'service-recommended',
  'Service Due': 'service-due',
  'Requires Attention': 'requires-attention',
};

export function HealthBadge({ status }: { status: HealthStatus }) {
  return (
    <Badge variant={healthVariantMap[status]} dot>
      {status}
    </Badge>
  );
}

export { Badge, badgeVariants };
