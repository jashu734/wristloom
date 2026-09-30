'use client';

// ============================================================
// Wristloom — Client Error Boundary
// Gracefully catches render faults with recovery options
// ============================================================

import * as React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/primitives/Button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('[Atelier Error Boundary]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#14110F] text-[#EDE6D6] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full border border-[rgba(239,68,68,0.30)] bg-[rgba(239,68,68,0.06)] flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-red-400 stroke-[1.5]" />
      </div>

      <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#B08D57] mb-3 block">
        Horological Interruption
      </span>

      <h1 className="font-display text-3xl sm:text-4xl text-[#EDE6D6] mb-3">
        Chronometer Out of Alignment
      </h1>

      <p className="text-sm text-[rgba(237,230,214,0.60)] max-w-md mb-8 leading-relaxed">
        An unexpected disturbance was encountered while rendering this experience. The atelier safeguards have caught the exception.
      </p>

      <div className="flex gap-4">
        <Button variant="primary" size="lg" onClick={() => reset()} className="inline-flex items-center gap-2">
          <RotateCcw className="w-4 h-4" /> Re-calibrate & Retry
        </Button>
      </div>
    </div>
  );
}
