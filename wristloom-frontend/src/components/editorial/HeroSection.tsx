import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/primitives/Button';
import { ArrowRight } from 'lucide-react';

// ─── Hero Section ─────────────────────────────────────────────
// Full-bleed hero with thread motif, editorial headline, and dual CTAs
// The thread-line motif appears here — this is one of its 7 approved locations.

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      aria-label="Welcome to Wristloom"
    >
      {/* ─── Background ──────────────────────────────── */}
      <div className="absolute inset-0 bg-[#14110F]">
        {/* Hero image with gradient overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1800&q=90)',
          }}
          role="img"
          aria-label="Close-up of a luxury watch"
        />
        {/* Layered gradients for editorial feel */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#14110F] via-[rgba(20,17,15,0.75)] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14110F] via-transparent to-[rgba(20,17,15,0.40)]" />
      </div>

      {/* ─── Thread Motif (approved location #1) ─────── */}
      <div className="thread-motif opacity-[0.06]" aria-hidden />

      {/* ─── Content ──────────────────────────────────── */}
      <div className="relative z-10 container-wl py-32 md:py-0">
        <div className="max-w-2xl">
          {/* Overline */}
          <div className="flex items-center gap-3 mb-8">
            <span className="brass-line" />
            <span className="text-overline">The Ownership Ecosystem</span>
          </div>

          {/* Display headline */}
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[80px] text-[#EDE6D6] leading-[1.05] tracking-[-0.03em] mb-6">
            Every Watch
            <br />
            <em className="not-italic text-[#B08D57]">Has a Story.</em>
            <br />
            We Keep It.
          </h1>

          {/* Body copy */}
          <p className="text-[rgba(237,230,214,0.65)] text-base md:text-lg leading-relaxed mb-10 max-w-xl">
            Wristloom is the definitive platform for discovering, authenticating, maintaining, and trading luxury timepieces. One ecosystem. Every stage of ownership.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" size="lg" asChild>
              <Link href="/shop">
                Explore Watches
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link href="/watch-vault">Enter Your Vault</Link>
            </Button>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex items-center gap-6">
            <div>
              <p className="font-mono text-[#B08D57] text-lg font-semibold">2,400+</p>
              <p className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)]">Watches Serviced</p>
            </div>
            <div className="w-px h-8 bg-[rgba(176,141,87,0.20)]" />
            <div>
              <p className="font-mono text-[#B08D57] text-lg font-semibold">98.7%</p>
              <p className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)]">Satisfaction Rate</p>
            </div>
            <div className="w-px h-8 bg-[rgba(176,141,87,0.20)]" />
            <div>
              <p className="font-mono text-[#B08D57] text-lg font-semibold">8 Cities</p>
              <p className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)]">House-Call Coverage</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Section Transition Motif (approved location #2) ─── */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#14110F] to-transparent z-10" aria-hidden />
    </section>
  );
}
