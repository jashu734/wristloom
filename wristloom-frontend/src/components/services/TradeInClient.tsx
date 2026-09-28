'use client';

import * as React from 'react';
import { RefreshCw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { ConfirmationPanel } from './AuthenticationClient';
import { generateRef } from '@/lib/utils';

const CREDIT_USES = [
  'Purchase a watch',
  'Repair service',
  'Full restoration',
  'Workshop booking',
  'Undecided',
];

const CONDITIONS = ['Mint', 'Excellent', 'Good', 'Fair', 'Poor'] as const;
type Condition = typeof CONDITIONS[number];

type State = 'idle' | 'submitting' | 'confirmed';

export function TradeInClient() {
  const [state, setState] = React.useState<State>('idle');
  const [refNumber, setRefNumber] = React.useState('');
  const [form, setForm] = React.useState({
    watch_brand: '',
    watch_model: '',
    reference_number: '',
    condition: '' as Condition | '',
    desired_credit_use: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('submitting');
    const ref = generateRef('TRD');
    setTimeout(() => {
      setRefNumber(ref);
      setState('confirmed');
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-[#14110F]">
      {/* Header */}
      <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
        <div className="container-wl py-16">
          <span className="text-overline block mb-3">Closed-Loop Economy</span>
          <h1 className="font-display text-4xl md:text-5xl text-[#EDE6D6] tracking-tight mb-4">
            Trade-In Program
          </h1>
          <p className="text-[rgba(237,230,214,0.60)] text-base md:text-lg max-w-2xl leading-relaxed">
            Your watches have value beyond the wrist. Trade in a timepiece and receive platform credit that never expires — redeemable toward your next purchase, a service, a restoration, or a workshop.
          </p>
        </div>
      </div>

      <div className="container-wl py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-16">

          {/* How It Works */}
          <div>
            <h2 className="font-display text-2xl text-[#EDE6D6] mb-10">How It Works</h2>

            <div className="space-y-8">
              {[
                {
                  step: '01',
                  title: 'Submit Your Watch',
                  body: 'Complete the form with your watch details, condition, and photos. Our team receives the request immediately.',
                },
                {
                  step: '02',
                  title: 'Receive a Valuation',
                  body: 'Within 3 business days, you receive a valuation based on current secondary market data, condition, and completeness. The offer is valid for 30 days.',
                },
                {
                  step: '03',
                  title: 'Credit to Your Account',
                  body: 'Accept the offer and your platform credit is applied instantly. Credits do not expire and can be split across multiple transactions.',
                },
                {
                  step: '04',
                  title: 'Use Your Credit',
                  body: 'Apply credit toward any watch purchase, repair service, restoration project, or workshop booking on Wristloom.',
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-6">
                  <div className="font-mono text-3xl text-[rgba(176,141,87,0.20)] font-semibold flex-shrink-0 w-12">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-[#EDE6D6] mb-2">{item.title}</h3>
                    <p className="text-sm text-[rgba(237,230,214,0.55)] leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Credit use options */}
            <div className="mt-12 bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-6">
              <h3 className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] mb-4">
                Credit Can Be Applied Toward
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'New watch purchases',
                  'Repair services',
                  'Full restorations',
                  'Workshop sessions',
                  'Authentication fees',
                  'Strap & accessory orders',
                ].map((use) => (
                  <div key={use} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-[#B08D57] flex-shrink-0" aria-hidden />
                    <span className="text-sm text-[rgba(237,230,214,0.60)]">{use}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div>
            {state === 'confirmed' ? (
              <ConfirmationPanel
                refNumber={refNumber}
                title="Trade-In Request Received"
                description="Our valuation team will assess your watch and contact you within 3 business days with a credit offer."
              />
            ) : (
              <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6">
                <div className="flex items-center gap-3 mb-6">
                  <RefreshCw className="w-5 h-5 text-[#B08D57]" />
                  <h2 className="font-display text-xl text-[#EDE6D6]">Submit Your Watch</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1.5">
                        Brand <span className="text-[#B08D57]">*</span>
                      </label>
                      <input name="watch_brand" value={form.watch_brand} onChange={handleChange} required placeholder="e.g. Rolex" className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3 py-2.5 text-sm text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.25)] focus:border-[#B08D57] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1.5">
                        Model <span className="text-[#B08D57]">*</span>
                      </label>
                      <input name="watch_model" value={form.watch_model} onChange={handleChange} required placeholder="e.g. Submariner" className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3 py-2.5 text-sm text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.25)] focus:border-[#B08D57] focus:outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1.5">
                      Reference Number
                    </label>
                    <input name="reference_number" value={form.reference_number} onChange={handleChange} placeholder="e.g. 126610LN" className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3 py-2.5 text-sm font-mono tracking-wider text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.25)] focus:border-[#B08D57] focus:outline-none" />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1.5">
                      Condition <span className="text-[#B08D57]">*</span>
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {CONDITIONS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, condition: c }))}
                          className={`text-[10px] font-mono tracking-wider uppercase px-2 py-2 rounded-[2px] border transition-all ${
                            form.condition === c
                              ? 'border-[#B08D57] text-[#B08D57] bg-[rgba(176,141,87,0.10)]'
                              : 'border-[rgba(176,141,87,0.15)] text-[rgba(237,230,214,0.45)] hover:border-[rgba(176,141,87,0.35)]'
                          }`}
                          aria-pressed={form.condition === c}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1.5">
                      Intended Credit Use
                    </label>
                    <select name="desired_credit_use" value={form.desired_credit_use} onChange={handleChange} className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3 py-2.5 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none">
                      <option value="" disabled>Select…</option>
                      {CREDIT_USES.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>

                  <div className="divider" />

                  <div>
                    <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1.5">
                      Name <span className="text-[#B08D57]">*</span>
                    </label>
                    <input name="contact_name" value={form.contact_name} onChange={handleChange} required className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3 py-2.5 text-sm text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.25)] focus:border-[#B08D57] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1.5">
                      Email <span className="text-[#B08D57]">*</span>
                    </label>
                    <input type="email" name="contact_email" value={form.contact_email} onChange={handleChange} required className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3 py-2.5 text-sm text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.25)] focus:border-[#B08D57] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1.5">
                      Phone
                    </label>
                    <input type="tel" name="contact_phone" value={form.contact_phone} onChange={handleChange} className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3 py-2.5 text-sm text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.25)] focus:border-[#B08D57] focus:outline-none" />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    loading={state === 'submitting'}
                  >
                    Submit Trade-In Request
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
