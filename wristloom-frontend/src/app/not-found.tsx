// ============================================================
// Wristloom — 404 Not Found Page
// Bespoke Atelier horological styling
// ============================================================

import Link from 'next/link';
import { Compass, ArrowRight } from 'lucide-react';
import { Button } from '@/components/primitives/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#14110F] text-[#EDE6D6] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full border border-[rgba(176,141,87,0.30)] bg-[rgba(176,141,87,0.05)] flex items-center justify-center mb-6">
        <Compass className="w-8 h-8 text-[#B08D57] stroke-[1.5]" />
      </div>

      <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#B08D57] mb-3 block">
        Error 404 — Registry Anomaly
      </span>

      <h1 className="font-display text-4xl sm:text-5xl text-[#EDE6D6] mb-4 max-w-lg">
        Reference Not Found in the Atelier Vault
      </h1>

      <p className="text-sm text-[rgba(237,230,214,0.60)] max-w-md mb-8 leading-relaxed">
        The horological coordinate or timepiece archive you are requesting has either been decommissioned or relocated.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="primary" size="lg" asChild>
          <Link href="/shop" className="inline-flex items-center gap-2">
            Explore Watch Collection <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
        <Button variant="ghost" size="lg" asChild>
          <Link href="/">
            Return to Atelier Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
