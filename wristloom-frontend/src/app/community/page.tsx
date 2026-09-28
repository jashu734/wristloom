import type { Metadata } from 'next';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { CommunityClient } from '@/components/editorial/CommunityClient';

export const metadata: Metadata = {
  title: 'Collector Community',
  description: 'Stories, collections, discussions, and watch photography from the Wristloom collector community.',
};

export default function CommunityPage() {
  return (
    <SiteWrapper>
      <div className="min-h-screen bg-[#14110F]">
        <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
          <div className="container-wl py-16">
            <span className="text-overline block mb-3">The Collector House</span>
            <h1 className="font-display text-4xl md:text-5xl text-[#EDE6D6] tracking-tight mb-4">
              Collector Community
            </h1>
            <p className="text-[rgba(237,230,214,0.60)] max-w-xl leading-relaxed">
              Stories, collections, discussions, and photography from serious collectors. The community is built on craft, not speculation.
            </p>
          </div>
        </div>

        <CommunityClient />
      </div>
    </SiteWrapper>
  );
}
