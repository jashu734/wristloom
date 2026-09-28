import * as React from 'react';

// ─── Ecosystem Section ────────────────────────────────────────
// Visualises the closed-loop ownership lifecycle:
// Purchase → Own → Maintain → Restore → Trade-In → Upgrade → Repeat

const LIFECYCLE_STEPS = [
  { label: 'Discover', sublabel: 'Curated multi-brand marketplace' },
  { label: 'Purchase', sublabel: 'New & certified pre-owned' },
  { label: 'Authenticate', sublabel: 'Expert multi-stage verification' },
  { label: 'Own', sublabel: 'Digital Watch Vault management' },
  { label: 'Maintain', sublabel: 'House-call & send-in repair' },
  { label: 'Restore', sublabel: 'Full restoration projects' },
  { label: 'Trade-In', sublabel: 'Receive platform credit' },
  { label: 'Upgrade', sublabel: 'Apply credit toward your next piece' },
];

export function EcosystemSection() {
  return (
    <section className="section-padding bg-[#14110F]" aria-labelledby="ecosystem-heading">
      <div className="container-wl">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-overline block mb-3">The Lifecycle</span>
          <h2
            id="ecosystem-heading"
            className="font-display text-3xl md:text-4xl text-[#EDE6D6] tracking-tight mb-4"
          >
            A Relationship That Continues Long After Purchase
          </h2>
          <p className="text-[rgba(237,230,214,0.55)] text-base leading-relaxed mx-auto">
            Most watch platforms end at the sale. Wristloom begins there. Every interaction strengthens your relationship with your timepieces — and with us.
          </p>
        </div>

        {/* Lifecycle connector */}
        <div className="relative">
          {/* Thread connector line (approved location — section transition) */}
          <div className="hidden md:block absolute top-5 left-0 right-0 h-px" aria-hidden>
            <svg width="100%" height="2" viewBox="0 0 800 2" preserveAspectRatio="none" fill="none">
              <path
                d="M0 1 Q100 1 200 1 Q300 1 400 1 Q500 1 600 1 Q700 1 800 1"
                stroke="#B08D57"
                strokeWidth="0.5"
                strokeDasharray="4 6"
                strokeOpacity="0.35"
              />
            </svg>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-6 md:gap-4">
            {LIFECYCLE_STEPS.map((step, i) => (
              <div key={step.label} className="flex flex-col items-center text-center">
                {/* Node */}
                <div className="relative mb-4">
                  <div className="w-10 h-10 rounded-full border border-[rgba(176,141,87,0.30)] flex items-center justify-center bg-[#1E1A17] z-10 relative">
                    <span className="font-mono text-[10px] text-[#B08D57]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  {/* Pulse for first step */}
                  {i === 0 && (
                    <div className="absolute inset-0 rounded-full border border-[#B08D57]/20 animate-ping" aria-hidden />
                  )}
                </div>

                {/* Label */}
                <p className="font-display text-sm text-[#EDE6D6] mb-1">{step.label}</p>
                <p className="font-mono text-[9px] tracking-wider uppercase text-[rgba(237,230,214,0.35)] leading-tight">
                  {step.sublabel}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Closing statement */}
        <div className="mt-16 text-center">
          <div className="inline-block">
            <p className="font-mono text-[11px] tracking-widest uppercase text-[rgba(237,230,214,0.35)]">
              And then it begins again.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
