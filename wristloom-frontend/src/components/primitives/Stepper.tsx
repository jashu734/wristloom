import * as React from 'react';
import { cn } from '@/lib/utils';

// ─── Stepper ──────────────────────────────────────────────────
// Used in multi-step booking and submission flows

export interface Step {
  id: string | number;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number; // 0-indexed
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <nav aria-label="Progress" className={cn('w-full', className)}>
      <ol className="flex items-start gap-0">
        {steps.map((step, index) => {
          const state =
            index < currentStep ? 'completed' : index === currentStep ? 'active' : 'upcoming';
          const isLast = index === steps.length - 1;

          return (
            <li key={step.id} className="flex-1 flex items-start">
              {/* Step node + connector */}
              <div className="flex flex-col items-center w-full">
                <div className="flex items-center w-full">
                  {/* Connector left */}
                  <div
                    className={cn(
                      'flex-1 h-px transition-colors duration-300',
                      index === 0 ? 'invisible' : '',
                      index <= currentStep
                        ? 'bg-[#B08D57]'
                        : 'bg-[rgba(176,141,87,0.15)]'
                    )}
                  />
                  {/* Node */}
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 border text-xs font-mono',
                      state === 'completed' &&
                        'bg-[#B08D57] border-[#B08D57] text-[#14110F]',
                      state === 'active' &&
                        'bg-transparent border-[#B08D57] text-[#B08D57] ring-2 ring-[rgba(176,141,87,0.25)] ring-offset-1 ring-offset-[#14110F]',
                      state === 'upcoming' &&
                        'bg-transparent border-[rgba(176,141,87,0.20)] text-[rgba(237,230,214,0.35)]'
                    )}
                    aria-current={state === 'active' ? 'step' : undefined}
                  >
                    {state === 'completed' ? (
                      <CheckIcon />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  {/* Connector right */}
                  <div
                    className={cn(
                      'flex-1 h-px transition-colors duration-300',
                      isLast ? 'invisible' : '',
                      index < currentStep
                        ? 'bg-[#B08D57]'
                        : 'bg-[rgba(176,141,87,0.15)]'
                    )}
                  />
                </div>
                {/* Labels */}
                <div className="mt-2 text-center px-1 hidden sm:block">
                  <p
                    className={cn(
                      'text-[10px] font-mono tracking-wider uppercase transition-colors duration-200',
                      state === 'active' ? 'text-[#B08D57]' : 'text-[rgba(237,230,214,0.40)]'
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      className="w-3.5 h-3.5"
      aria-hidden
    >
      <path
        d="M2 6l3 3 5-5"
        stroke="#14110F"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
