import type { Metadata } from 'next';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { MOCK_FAQ } from '@/lib/mock-data';
import { FAQ_CATEGORIES } from '@/lib/constants';
import { FAQAccordion } from '@/components/editorial/FAQAccordion';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about Wristloom\'s watch authentication, repair, trade-in, Watch Vault, and concierge services.',
};

export default function FAQPage() {
  return (
    <SiteWrapper>
      <div className="min-h-screen bg-[#14110F]">
        <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
          <div className="container-wl py-16">
            <span className="text-overline block mb-3">Support</span>
            <h1 className="font-display text-4xl md:text-5xl text-[#EDE6D6] tracking-tight mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-[rgba(237,230,214,0.60)] max-w-xl leading-relaxed">
              Everything you need to know about our authentication process, house-call repairs, trade-in programme, and Watch Vault.
            </p>
          </div>
        </div>
        <FAQAccordion items={MOCK_FAQ} categories={[...FAQ_CATEGORIES]} />
      </div>
    </SiteWrapper>
  );
}
