'use client';

// ============================================================
// Wristloom — Root Global Error Boundary
// Catches uncaught errors in root layout
// ============================================================

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#14110F] text-[#EDE6D6] flex flex-col items-center justify-center p-6 text-center font-sans">
        <h1 className="text-3xl font-serif text-[#EDE6D6] mb-3">Wristloom Atelier Exception</h1>
        <p className="text-sm text-[rgba(237,230,214,0.60)] max-w-md mb-6">
          A critical system error occurred. Please refresh or attempt to re-engage the atelier engine.
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 bg-[#B08D57] text-[#14110F] font-mono text-xs uppercase tracking-wider font-semibold rounded-[2px]"
        >
          Re-initialize Session
        </button>
      </body>
    </html>
  );
}
