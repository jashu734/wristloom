'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Compass, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function ServiceTrackingSearch() {
  const router = useRouter();
  const [reference, setReference] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reference.trim();
    if (!trimmed) {
      setError('Please enter a booking ID or reference code.');
      return;
    }
    setError('');
    router.push(`/service-tracking/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(237,230,214,0.4)]" />
          <input
            type="text"
            value={reference}
            onChange={(e) => {
              setReference(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g. WL-DEMO-2026 or your booking ID"
            className="w-full bg-[#1A1614] border border-[rgba(176,141,87,0.25)] rounded px-4 py-3 pl-10 text-sm text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.3)] focus:outline-none focus:border-[#B08D57] transition-colors"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded bg-[#B08D57] hover:bg-[#C5A059] text-[#0E0C0A] font-medium text-sm transition-colors shadow-lg shadow-[#B08D57]/20"
        >
          Track Service
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-[rgba(237,230,214,0.45)]">
        <span>Want to preview the live technician radar?</span>
        <Link
          href="/service-tracking/demo"
          className="inline-flex items-center gap-1 text-[#B08D57] hover:underline font-mono"
        >
          <Compass className="w-3.5 h-3.5" />
          Launch Live Tracking Demo
        </Link>
      </div>
    </div>
  );
}
