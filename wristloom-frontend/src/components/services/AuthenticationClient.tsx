'use client';

import * as React from 'react';
import { Shield, Search, FileText, CheckCircle, Award, ArrowRight } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { generateRef } from '@/lib/utils';

// ─── Authentication Process Steps ────────────────────────────
const AUTH_STEPS = [
  {
    icon: Search,
    title: 'Component Inspection',
    description: 'Physical examination of case, dial, hands, crown, movement, and all visible components against manufacturer specifications.',
  },
  {
    icon: FileText,
    title: 'Reference & Serial Verification',
    description: 'Cross-referencing serial and reference numbers against manufacturer databases and known-good examples.',
  },
  {
    icon: Shield,
    title: 'Condition Analysis',
    description: 'Detailed assessment of wear patterns, surface finishes, and any signs of replacement or modification.',
  },
  {
    icon: FileText,
    title: 'Documentation Review',
    description: 'Examination of box, papers, warranty cards, service records, and provenance documentation.',
  },
  {
    icon: Award,
    title: 'Certification',
    description: 'Certified watches receive a Wristloom Authentication Certificate with a unique ID, valid for the life of the timepiece.',
  },
];

type SubmissionState = 'idle' | 'submitting' | 'confirmed';

// ─── Authentication Client ────────────────────────────────────
export function AuthenticationClient() {
  const [state, setState] = React.useState<SubmissionState>('idle');
  const [refNumber, setRefNumber] = React.useState('');
  const [form, setForm] = React.useState({
    brand: '',
    model: '',
    reference_number: '',
    description: '',
    ownership_context: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('submitting');
    const ref = generateRef('AUTH');
    setTimeout(() => {
      setRefNumber(ref);
      setState('confirmed');
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-[#14110F]">
      {/* ─── Page Header ──────────────────────────────── */}
      <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)] relative overflow-hidden">
        <div className="thread-motif opacity-[0.05]" aria-hidden />
        <div className="container-wl py-16 relative z-10">
          <span className="text-overline block mb-3">Provenance & Trust</span>
          <h1 className="font-display text-4xl md:text-5xl text-[#EDE6D6] tracking-tight mb-4">
            Authentication Center
          </h1>
          <p className="text-[rgba(237,230,214,0.60)] text-base md:text-lg max-w-2xl leading-relaxed">
            Our multi-stage authentication process is conducted by certified horologists with decades of experience across the world&apos;s most significant watchmakers. A Wristloom Authentication Certificate is the definitive statement of a timepiece&apos;s provenance.
          </p>
        </div>
      </div>

      <div className="container-wl py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-16">

          {/* ─── Process Explanation ──────────────────── */}
          <div>
            <div className="mb-10">
              <span className="brass-line block mb-4" />
              <h2 className="font-display text-2xl text-[#EDE6D6] mb-4">The Verification Process</h2>
              <p className="text-sm text-[rgba(237,230,214,0.55)] leading-relaxed">
                Every authentication submission enters a structured five-stage workflow. The process typically takes 5–10 business days, after which you receive a detailed report regardless of outcome.
              </p>
            </div>

            <div className="space-y-0">
              {AUTH_STEPS.map((step, i) => {
                const Icon = step.icon;
                const isLast = i === AUTH_STEPS.length - 1;
                return (
                  <div key={step.title} className="flex gap-5">
                    {/* Connector */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full border border-[rgba(176,141,87,0.40)] bg-[rgba(176,141,87,0.08)] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-[#B08D57]" aria-hidden />
                      </div>
                      {!isLast && (
                        <div className="flex-1 w-px bg-[rgba(176,141,87,0.15)] my-2 min-h-[2rem]" aria-hidden />
                      )}
                    </div>

                    {/* Content */}
                    <div className={`pb-8 ${isLast ? '' : ''}`}>
                      <p className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] mb-1">
                        Stage {i + 1}
                      </p>
                      <h3 className="font-display text-base text-[#EDE6D6] mb-2">{step.title}</h3>
                      <p className="text-sm text-[rgba(237,230,214,0.55)] leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trust signals */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              {[
                { stat: '2,400+', label: 'Authentications Completed' },
                { stat: '99.2%', label: 'Accuracy Rate' },
                { stat: '5–10', label: 'Business Days' },
                { stat: 'Lifetime', label: 'Certificate Validity' },
              ].map((item) => (
                <div key={item.label} className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-4">
                  <p className="font-mono text-xl text-[#B08D57] mb-1">{item.stat}</p>
                  <p className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)]">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Submission Form / Confirmation ──────── */}
          <div>
            {state === 'confirmed' ? (
              <ConfirmationPanel
                refNumber={refNumber}
                title="Authentication Request Submitted"
                description="Your submission has been received and assigned to our authentication team. You will receive an email confirmation within one hour."
              />
            ) : (
              <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6">
                <h2 className="font-display text-xl text-[#EDE6D6] mb-1">Submit for Authentication</h2>
                <p className="text-sm text-[rgba(237,230,214,0.50)] mb-6">
                  Complete the form below and our team will be in touch to arrange the process.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Brand" name="brand" value={form.brand} onChange={handleChange} required placeholder="e.g. Rolex" />
                    <FormField label="Model" name="model" value={form.model} onChange={handleChange} required placeholder="e.g. Submariner" />
                  </div>
                  <FormField label="Reference Number" name="reference_number" value={form.reference_number} onChange={handleChange} placeholder="e.g. 126610LN" mono />
                  <FormField label="Description" name="description" value={form.description} onChange={handleChange} multiline placeholder="Brief description of the watch and its condition" required />
                  <FormField label="Ownership Context" name="ownership_context" value={form.ownership_context} onChange={handleChange} multiline placeholder="How did you acquire this watch? Do you have box and papers?" />

                  <div className="divider" />

                  <FormField label="Your Name" name="contact_name" value={form.contact_name} onChange={handleChange} required />
                  <FormField label="Email" name="contact_email" value={form.contact_email} onChange={handleChange} required type="email" />
                  <FormField label="Phone" name="contact_phone" value={form.contact_phone} onChange={handleChange} type="tel" />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    loading={state === 'submitting'}
                  >
                    Submit Authentication Request
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <p className="text-[10px] font-mono text-[rgba(237,230,214,0.35)] text-center">
                    By submitting you agree to our Terms of Service and Privacy Policy.
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Shared ConfirmationPanel ─────────────────────────────────
export function ConfirmationPanel({
  refNumber,
  title,
  description,
}: {
  refNumber: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.20)] rounded-[2px] p-8 text-center relative overflow-hidden">
      <div className="thread-motif opacity-[0.04]" aria-hidden />
      <div className="relative z-10">
        {/* Success icon */}
        <div className="w-14 h-14 rounded-full bg-[rgba(176,141,87,0.10)] border border-[rgba(176,141,87,0.30)] flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-7 h-7 text-[#B08D57]" />
        </div>

        <h3 className="font-display text-2xl text-[#EDE6D6] mb-3">{title}</h3>
        <p className="text-sm text-[rgba(237,230,214,0.55)] mb-8 leading-relaxed">{description}</p>

        {/* Reference number — in mono */}
        <div className="bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-6 py-4 mb-6">
          <p className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] mb-1">
            Reference Number
          </p>
          <p className="font-mono text-lg text-[#B08D57] tracking-wider">{refNumber}</p>
        </div>

        <p className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.35)]">
          Save this reference number for your records
        </p>
      </div>
    </div>
  );
}

// ─── Form Field ───────────────────────────────────────────────
function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  type = 'text',
  multiline,
  mono,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  multiline?: boolean;
  mono?: boolean;
}) {
  const baseClass = `w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3 py-2.5 text-sm focus:border-[#B08D57] focus:outline-none text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.25)] transition-colors ${
    mono ? 'font-mono tracking-wider' : ''
  }`;

  return (
    <div>
      <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1.5">
        {label} {required && <span className="text-[#B08D57]">*</span>}
      </label>
      {multiline ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={3}
          className={baseClass}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={baseClass}
        />
      )}
    </div>
  );
}
