import type { Metadata } from 'next';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { CheckCircle, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Service Warranty',
  description: 'Wristloom\'s service warranty policy — coverage guarantees, validity periods, covered repairs, and how to make a warranty claim.',
};

export default function WarrantyPage() {
  return (
    <SiteWrapper>
      <div className="min-h-screen bg-[#14110F]">
        <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
          <div className="container-wl py-16">
            <span className="text-overline block mb-3">Support</span>
            <h1 className="font-display text-4xl md:text-5xl text-[#EDE6D6] tracking-tight mb-4">
              Service Warranty
            </h1>
            <p className="text-[rgba(237,230,214,0.60)] max-w-xl leading-relaxed">
              Our work is backed by our word — and by a formal warranty that covers every service we perform.
            </p>
          </div>
        </div>

        <div className="container-wl py-16 max-w-3xl mx-auto">
          {/* Warranty periods */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {[
              { service: 'Full Service & Overhaul', period: '24 Months', icon: '⟳' },
              { service: 'Crystal & Component Replacement', period: '12 Months', icon: '◈' },
              { service: 'Regulation & Adjustment', period: '12 Months', icon: '◉' },
            ].map((w) => (
              <div key={w.service} className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-5 text-center">
                <p className="font-mono text-2xl text-[#B08D57] mb-2">{w.period}</p>
                <p className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)]">{w.service}</p>
              </div>
            ))}
          </div>

          <div className="prose-wl space-y-8">
            <Section title="What's Covered">
              {[
                'Any defect in workmanship directly related to the service performed',
                'Movement issues arising from parts installed during the service',
                'Timekeeping accuracy within agreed regulation tolerances',
                'Water resistance failure if a seal test was part of the service',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden />
                  <p className="text-sm text-[rgba(237,230,214,0.65)]">{item}</p>
                </div>
              ))}
            </Section>

            <Section title="What's Not Covered">
              <ul className="space-y-2">
                {[
                  'Damage caused by impact, misuse, or unauthorised service after our work',
                  'Normal wear and variations in timekeeping due to lifestyle (position, activity)',
                  'Cosmetic changes not present at the time of return',
                  'Services performed on watches subsequently serviced by a third party',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-[rgba(237,230,214,0.35)] flex-shrink-0 mt-0.5">×</span>
                    <p className="text-sm text-[rgba(237,230,214,0.55)]">{item}</p>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="How to Make a Claim">
              <p className="text-sm text-[rgba(237,230,214,0.60)] leading-relaxed mb-4">
                If you believe your watch has developed an issue covered by our warranty, contact us via email at <a href="mailto:warranty@wristloom.com" className="text-[#B08D57] hover:underline">warranty@wristloom.com</a> or call our concierge line with your service reference number. We will arrange collection at no charge.
              </p>
              <p className="text-sm text-[rgba(237,230,214,0.60)] leading-relaxed">
                Claims are assessed within 5 business days of receipt. If the issue falls within warranty coverage, the repair is performed at no charge. If it falls outside, we provide a full diagnostic report and a cost estimate before proceeding.
              </p>
            </Section>
          </div>
        </div>
      </div>
    </SiteWrapper>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-xl text-[#EDE6D6] mb-4 pb-3 border-b border-[rgba(176,141,87,0.10)]">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
