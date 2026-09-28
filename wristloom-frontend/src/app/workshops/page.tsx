import type { Metadata } from 'next';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { WorkshopsClient } from '@/components/editorial/WorkshopsClient';

export const metadata: Metadata = {
  title: 'Watch-Building Workshops',
  description: 'Learn watchmaking from a master. Assemble your own timepiece, receive a digital assembly record, and add it to your Wristloom Watch Vault.',
};

export default function WorkshopsPage() {
  return (
    <SiteWrapper>
      <div className="min-h-screen bg-[#14110F]">
        <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
          <div className="container-wl py-16">
            <span className="text-overline block mb-3">The Atelier</span>
            <h1 className="font-display text-4xl md:text-5xl text-[#EDE6D6] tracking-tight mb-4">
              Watch-Building Workshops
            </h1>
            <p className="text-[rgba(237,230,214,0.60)] max-w-xl leading-relaxed">
              Under the guidance of a master watchmaker, you will assemble a timepiece from components and leave with a deep understanding of the craft. Your completed watch receives a digital assembly record added to your Wristloom Vault.
            </p>
          </div>
        </div>

        <WorkshopsClient />
      </div>
    </SiteWrapper>
  );
}
