'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ─── Button Variants ──────────────────────────────────────────
const buttonVariants = cva(
  // base
  'inline-flex items-center justify-center gap-2 font-sans text-sm font-medium tracking-wide transition-all duration-200 cursor-pointer select-none disabled:pointer-events-none disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B08D57]',
  {
    variants: {
      variant: {
        // Primary — Aged Brass fill
        primary:
          'bg-[#B08D57] text-[#14110F] hover:bg-[#C49D67] active:bg-[#9A7A48]',
        // Oxblood — for single key actions only (one per view)
        oxblood:
          'bg-[#6B2737] text-[#EDE6D6] hover:bg-[#7E3040] active:bg-[#5A2030]',
        // Ghost — outline on dark
        ghost:
          'border border-[rgba(176,141,87,0.30)] text-[#EDE6D6] hover:border-[#B08D57] hover:text-[#B08D57] bg-transparent',
        // Subtle — for secondary actions
        subtle:
          'bg-[rgba(176,141,87,0.08)] text-[#EDE6D6] hover:bg-[rgba(176,141,87,0.15)] border border-transparent hover:border-[rgba(176,141,87,0.20)]',
        // Destructive
        destructive:
          'bg-red-900/30 text-red-300 border border-red-900/50 hover:bg-red-900/50',
        // Link
        link:
          'text-[#B08D57] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-8 px-4 text-xs rounded-[2px]',
        md: 'h-10 px-6 rounded-[2px]',
        lg: 'h-12 px-8 text-base rounded-[2px]',
        xl: 'h-14 px-10 text-base tracking-widest uppercase rounded-[2px]',
        icon: 'h-10 w-10 rounded-[2px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

// ─── Button Component ─────────────────────────────────────────
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <>
            <LoadingDots />
            <span className="sr-only">Loading</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

// ─── Loading Dots ─────────────────────────────────────────────
function LoadingDots() {
  return (
    <span className="flex items-center gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1 h-1 rounded-full bg-current animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  );
}

export { Button, buttonVariants };
