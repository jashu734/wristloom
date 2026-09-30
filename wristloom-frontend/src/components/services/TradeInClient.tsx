'use client';

import * as React from 'react';
import {
  RefreshCw,
  ArrowRight,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  Clock,
  Coins,
  Package,
} from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { ConfirmationPanel } from './AuthenticationClient';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

import { WATCH_BRANDS } from '@/lib/constants';

const POPULAR_BRANDS = WATCH_BRANDS;

const BRAND_BASELINES: Record<string, { min: number; max: number }> = {
  titan: { min: 8000, max: 25000 },
  fastrack: { min: 2500, max: 6000 },
  sonata: { min: 1200, max: 3500 },
  timex: { min: 6000, max: 18000 },
  casio: { min: 5000, max: 22000 },
  fossil: { min: 7000, max: 18000 },
  seiko: { min: 25000, max: 95000 },
  citizen: { min: 18000, max: 65000 },
  tissot: { min: 35000, max: 120000 },
  'tag heuer': { min: 95000, max: 320000 },
  rado: { min: 75000, max: 240000 },
  omega: { min: 280000, max: 750000 },
};

const CONDITIONS = ['Mint', 'Excellent', 'Good', 'Fair', 'Poor'] as const;
type Condition = (typeof CONDITIONS)[number];

const BOX_AND_PAPERS = [
  'Full Set (Box & Papers)',
  'Watch & Papers',
  'Watch & Box',
  'Watch Only',
] as const;
type BoxAndPapers = (typeof BOX_AND_PAPERS)[number];

const CREDIT_USES = [
  'Purchase a new timepiece',
  'Atelier restoration & service',
  'Bespoke leather strap & accessory',
  'Horology workshop masterclass',
  'Hold as liquid store credit',
];

export function TradeInClient() {
  const [state, setState] = React.useState<'idle' | 'submitting' | 'confirmed'>('idle');
  const [refNumber, setRefNumber] = React.useState('');
  const [confirmedOffer, setConfirmedOffer] = React.useState<number | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    watch_brand: 'Seiko',
    watch_model: 'Presage Cocktail Time',
    reference_number: 'SRPB43J1',
    condition: 'Excellent' as Condition,
    box_and_papers: 'Full Set (Box & Papers)' as BoxAndPapers,
    desired_credit_use: 'Purchase a new timepiece',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
  });

  // Calculate live instant valuation
  const brandKey = form.watch_brand.toLowerCase().trim();
  const baseline = BRAND_BASELINES[brandKey] || { min: 300000, max: 650000 };
  const condMult =
    form.condition === 'Mint'
      ? 1.0
      : form.condition === 'Excellent'
      ? 0.92
      : form.condition === 'Good'
      ? 0.82
      : form.condition === 'Fair'
      ? 0.7
      : 0.52;
  const scopeMult =
    form.box_and_papers === 'Full Set (Box & Papers)'
      ? 1.15
      : form.box_and_papers === 'Watch & Papers'
      ? 1.08
      : form.box_and_papers === 'Watch & Box'
      ? 1.04
      : 0.95;

  const estimatedMin = Math.round(baseline.min * condMult * scopeMult);
  const estimatedMax = Math.round(baseline.max * condMult * scopeMult);
  const averageValuation = Math.round((estimatedMin + estimatedMax) / 2);
  const platformCreditOffer = Math.round(averageValuation * 1.05); // 5% bonus credit

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('submitting');
    setErrorMsg(null);

    try {
      const res = await fetch('/api/trade-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit trade-in request');
      }

      setRefNumber(data.tradeIn.tradeInReference);
      setConfirmedOffer(data.valuation.platformCreditOffer);
      setState('confirmed');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing trade-in valuation');
      setState('idle');
    }
  }

  return (
    <div className="min-h-screen bg-[#14110F]">
      {/* Header */}
      <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
        <div className="container-wl py-14">
          <span className="text-overline block mb-2">Secondary Market Atelier Valuation</span>
          <h1 className="font-display text-4xl md:text-5xl text-[#EDE6D6] tracking-tight mb-3">
            Trade-In & Valuation Program
          </h1>
          <p className="text-[rgba(237,230,214,0.60)] text-base md:text-lg max-w-2xl leading-relaxed">
            Obtain an instant secondary market algorithmic appraisal. Trade in your timepiece for permanent platform credit with a +5% acquisition bonus.
          </p>
        </div>
      </div>

      <div className="container-wl py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-12">
          
          {/* Left Column: Valuation Wizard */}
          <div>
            <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-[#B08D57]" />
                <h2 className="font-display text-2xl text-[#EDE6D6]">Timepiece Specifications</h2>
              </div>

              {/* Brand Chips */}
              <div className="space-y-2">
                <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)]">
                  Select Manufacture / Brand <span className="text-[#B08D57]">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_BRANDS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, watch_brand: b }))}
                      className={`font-mono text-xs px-3 py-1.5 rounded-[2px] border transition-all cursor-pointer ${
                        form.watch_brand === b
                          ? 'border-[#B08D57] text-[#EDE6D6] bg-[rgba(176,141,87,0.15)] font-semibold'
                          : 'border-[rgba(176,141,87,0.15)] text-[rgba(237,230,214,0.55)] hover:border-[#B08D57]/40'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Model & Reference */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1.5">
                    Model Designation <span className="text-[#B08D57]">*</span>
                  </label>
                  <input
                    type="text"
                    name="watch_model"
                    value={form.watch_model}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Submariner Date, Royal Oak, Speedmaster"
                    className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3.5 py-2.5 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1.5">
                    Reference Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="reference_number"
                    value={form.reference_number}
                    onChange={handleChange}
                    placeholder="e.g. 126610LN, 15500ST, 310.30"
                    className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3.5 py-2.5 text-sm font-mono text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                  />
                </div>
              </div>

              {/* Condition */}
              <div className="space-y-2">
                <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)]">
                  Physical & Mechanical Condition <span className="text-[#B08D57]">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, condition: c }))}
                      className={`text-xs font-mono tracking-wider uppercase py-2.5 px-2 rounded-[2px] border text-center transition-all cursor-pointer ${
                        form.condition === c
                          ? 'border-[#B08D57] text-[#B08D57] bg-[rgba(176,141,87,0.12)] font-semibold'
                          : 'border-[rgba(176,141,87,0.15)] text-[rgba(237,230,214,0.5)] hover:border-[rgba(176,141,87,0.3)]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Box and Papers */}
              <div className="space-y-2">
                <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)]">
                  Scope of Delivery (Box & Papers)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {BOX_AND_PAPERS.map((scope) => (
                    <button
                      key={scope}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, box_and_papers: scope }))}
                      className={`text-xs font-mono p-2.5 rounded-[2px] border text-left transition-all cursor-pointer flex items-center justify-between ${
                        form.box_and_papers === scope
                          ? 'border-[#B08D57] text-[#EDE6D6] bg-[rgba(176,141,87,0.10)] font-semibold'
                          : 'border-[rgba(176,141,87,0.15)] text-[rgba(237,230,214,0.5)] hover:border-[rgba(176,141,87,0.3)]'
                      }`}
                    >
                      <span>{scope}</span>
                      {scope.includes('Full Set') && (
                        <span className="text-[9px] text-[#B08D57] uppercase font-bold">+15% Value</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Collector Details Form */}
              <form onSubmit={handleSubmit} className="pt-4 border-t border-[rgba(176,141,87,0.15)] space-y-4">
                <h3 className="font-display text-lg text-[#EDE6D6]">Collector Contact for Appraisal Report</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1">
                      Full Legal Name <span className="text-[#B08D57]">*</span>
                    </label>
                    <input
                      type="text"
                      name="contact_name"
                      required
                      value={form.contact_name}
                      onChange={handleChange}
                      placeholder="e.g. Vikram Singhania"
                      className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3.5 py-2.5 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1">
                      Email Address <span className="text-[#B08D57]">*</span>
                    </label>
                    <input
                      type="email"
                      name="contact_email"
                      required
                      value={form.contact_email}
                      onChange={handleChange}
                      placeholder="collector@wristloom.com"
                      className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3.5 py-2.5 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      name="contact_phone"
                      value={form.contact_phone}
                      onChange={handleChange}
                      placeholder="+91 98200 12345"
                      className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3.5 py-2.5 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1">
                      Target Credit Application
                    </label>
                    <select
                      name="desired_credit_use"
                      value={form.desired_credit_use}
                      onChange={handleChange}
                      className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3.5 py-2.5 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                    >
                      {CREDIT_USES.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded bg-red-950/20 border border-red-500/30 text-xs text-red-400">
                    {errorMsg}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full cursor-pointer shadow-lg shadow-[#B08D57]/20"
                  loading={state === 'submitting'}
                >
                  Confirm & Lock Trade-In Valuation Offer
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </form>
            </div>
          </div>

          {/* Right Column: Live Real-Time Valuation Card */}
          <div className="space-y-6">
            {state === 'confirmed' ? (
              <div className="bg-[#1E1A17] border border-[#B08D57] p-8 rounded-[2px] text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div>
                  <span className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] block mb-1">
                    Trade-In Dossier Opened
                  </span>
                  <h3 className="font-display text-2xl text-[#EDE6D6]">Valuation Offer Locked</h3>
                  <p className="font-mono text-sm text-[#B08D57] font-semibold mt-1">
                    Ref: {refNumber}
                  </p>
                </div>
                <div className="bg-[#14110F] p-4 rounded border border-[rgba(176,141,87,0.15)] text-xs space-y-1">
                  <p className="text-[rgba(237,230,214,0.5)]">Locked Credit Offer:</p>
                  <p className="font-mono text-xl text-emerald-400 font-bold">
                    {confirmedOffer ? formatCurrency(confirmedOffer) : formatCurrency(platformCreditOffer)}
                  </p>
                  <p className="text-[10px] text-[rgba(237,230,214,0.4)]">
                    Valid for 30 calendar days upon physical horological inspection.
                  </p>
                </div>
                <div className="space-y-2 pt-2">
                  <Button variant="primary" size="md" className="w-full" asChild>
                    <Link href="/shop">
                      Explore Timepieces to Acquire
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full" onClick={() => setState('idle')}>
                    Value Another Watch
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-[#1A1614] border-2 border-[#B08D57] rounded-[2px] p-6 shadow-2xl space-y-6 sticky top-24">
                <div className="flex items-center justify-between border-b border-[rgba(176,141,87,0.15)] pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#B08D57]" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#B08D57] font-semibold">
                      Real-Time Secondary Market Engine
                    </span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                <div>
                  <span className="font-mono text-[10px] uppercase text-[rgba(237,230,214,0.4)] block mb-1">
                    {form.watch_brand} {form.watch_model}
                  </span>
                  <p className="font-mono text-xs text-[rgba(237,230,214,0.6)]">
                    Estimated Secondary Valuation:
                  </p>
                  <h3 className="font-display text-2xl text-[#EDE6D6] font-medium mt-0.5">
                    {formatCurrency(estimatedMin)} — {formatCurrency(estimatedMax)}
                  </h3>
                </div>

                {/* Instant Atelier Credit Offer */}
                <div className="bg-[#14110F] border border-[#B08D57]/40 rounded p-4 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#B08D57] font-semibold flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-[#B08D57]" />
                      Instant Wristloom Credit Offer
                    </span>
                    <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                      +5% Bonus
                    </span>
                  </div>
                  <p className="font-mono text-2xl text-emerald-400 font-bold">
                    {formatCurrency(platformCreditOffer)}
                  </p>
                  <p className="text-[10px] text-[rgba(237,230,214,0.45)] mt-1">
                    Applicable immediately toward any timepiece acquisition, restoration, or workshop booking.
                  </p>
                </div>

                {/* Value Drivers Breakdown */}
                <div className="space-y-2.5 text-xs font-mono border-t border-[rgba(176,141,87,0.10)] pt-4">
                  <div className="flex justify-between text-[rgba(237,230,214,0.6)]">
                    <span>Condition Multiplier</span>
                    <span className="text-[#EDE6D6]">{Math.round(condMult * 100)}% ({form.condition})</span>
                  </div>
                  <div className="flex justify-between text-[rgba(237,230,214,0.6)]">
                    <span>Scope of Delivery</span>
                    <span className="text-[#EDE6D6]">{Math.round(scopeMult * 100)}% ({form.box_and_papers})</span>
                  </div>
                  <div className="flex justify-between text-[rgba(237,230,214,0.6)]">
                    <span>Market Liquidity Score</span>
                    <span className="text-[#B08D57] font-semibold">Tier 1 · Blue Chip</span>
                  </div>
                  <div className="flex justify-between text-[rgba(237,230,214,0.6)]">
                    <span>Atelier Credit Bonus</span>
                    <span className="text-emerald-400">+5% Extra Value</span>
                  </div>
                </div>

                {/* Trust guarantees */}
                <div className="pt-2 text-[10px] text-[rgba(237,230,214,0.4)] space-y-1">
                  <p>✓ Insured door-to-door courier collection with security seal.</p>
                  <p>✓ Inspection by Swiss-trained horologist within 48 hours.</p>
                  <p>✓ 100% price guarantee — no unexpected clawbacks.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
