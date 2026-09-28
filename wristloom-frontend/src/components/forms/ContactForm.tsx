'use client';

import * as React from 'react';
import { Button } from '@/components/primitives/Button';
import { ConfirmationPanel } from '@/components/services/AuthenticationClient';
import { generateRef } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

const TOPICS = ['General Enquiry', 'Repair Service', 'Authentication', 'Trade-In', 'Watch Vault', 'Workshops', 'Order Support', 'Press'];

type State = 'idle' | 'submitting' | 'confirmed';

export function ContactForm() {
  const [state, setState] = React.useState<State>('idle');
  const [refNumber, setRefNumber] = React.useState('');
  const [form, setForm] = React.useState({ name: '', email: '', topic: '', message: '' });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('submitting');
    setTimeout(() => {
      setRefNumber(generateRef('MSG'));
      setState('confirmed');
    }, 1200);
  }

  const inputClass = 'w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3 py-2.5 text-sm text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.25)] focus:border-[#B08D57] focus:outline-none transition-colors';
  const labelClass = 'block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1.5';

  if (state === 'confirmed') {
    return (
      <ConfirmationPanel
        refNumber={refNumber}
        title="Message Received"
        description="Our concierge team will respond within 4 business hours during operating hours (Mon–Sat, 10 AM – 7 PM IST)."
      />
    );
  }

  return (
    <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6">
      <h2 className="font-display text-xl text-[#EDE6D6] mb-6">Send a Message</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Name <span className="text-[#B08D57]">*</span></label>
          <input name="name" value={form.name} onChange={handleChange} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email <span className="text-[#B08D57]">*</span></label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Topic</label>
          <select name="topic" value={form.topic} onChange={handleChange} className={inputClass}>
            <option value="" disabled>Select a topic…</option>
            {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Message <span className="text-[#B08D57]">*</span></label>
          <textarea name="message" value={form.message} onChange={handleChange} required rows={5} placeholder="How can we help?" className={inputClass} />
        </div>
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={state === 'submitting'}>
          Send Message <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
