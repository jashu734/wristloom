import type { Metadata } from 'next';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { MOCK_CARE_GUIDES } from '@/lib/mock-data';
import { Clock, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Care Guides',
  description: 'Expert watch care and maintenance guides from Wristloom\'s certified horologists. Storage, handling, water resistance, mechanical maintenance, and more.',
};

export default function CareGuidesPage() {
  const categories = ['All', 'maintenance', 'storage', 'handling', 'water-resistance', 'mechanical'];

  return (
    <SiteWrapper>
      <div className="min-h-screen bg-[#14110F]">
        <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
          <div className="container-wl py-16">
            <span className="text-overline block mb-3">The Atelier</span>
            <h1 className="font-display text-4xl md:text-5xl text-[#EDE6D6] tracking-tight mb-4">
              Care Guides
            </h1>
            <p className="text-[rgba(237,230,214,0.60)] max-w-xl leading-relaxed">
              The difference between a watch that lasts a lifetime and one that doesn't often comes down to how it's maintained between services. These guides cover everything you need to know.
            </p>
          </div>
        </div>

        <div className="container-wl py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {MOCK_CARE_GUIDES.map((guide) => (
              <article key={guide.id} className="group bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] hover:border-[rgba(176,141,87,0.25)] rounded-[2px] p-6 transition-all duration-300 cursor-pointer">
                <span className="font-mono text-[9px] tracking-widest uppercase text-[#B08D57] mb-3 block">
                  {guide.category.replace('-', ' ')}
                </span>
                <h2 className="font-display text-lg text-[#EDE6D6] mb-3 leading-snug group-hover:text-[#B08D57] transition-colors">
                  {guide.title}
                </h2>
                <p className="text-sm text-[rgba(237,230,214,0.55)] leading-relaxed mb-5">
                  {guide.excerpt}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-[rgba(176,141,87,0.08)]">
                  <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.35)]">
                    <Clock className="w-3.5 h-3.5" aria-hidden />
                    {guide.read_time_minutes} min read
                  </span>
                  <ArrowRight className="w-4 h-4 text-[rgba(176,141,87,0.30)] group-hover:text-[#B08D57] transition-colors group-hover:translate-x-1 duration-200" />
                </div>
              </article>
            ))}

            {/* Additional guide cards with realistic content */}
            {[
              { title: 'Protecting your watch from magnetic fields', category: 'handling', excerpt: 'Modern environments are full of magnetic sources — from iPad covers to hotel room locks. Here is what you need to know.', mins: 4 },
              { title: 'Seasonal care: adjusting your routine for humidity and temperature', category: 'seasonal', excerpt: 'A watch serviced in Mumbai requires different care considerations than one worn in the Himalayas.', mins: 7 },
              { title: 'When to wear your watch in water — and when not to', category: 'water-resistance', excerpt: 'The distinction between a watch rated 30m and 300m is far greater than the numbers suggest.', mins: 5 },
            ].map((g, i) => (
              <article key={i} className="group bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] hover:border-[rgba(176,141,87,0.25)] rounded-[2px] p-6 transition-all duration-300 cursor-pointer">
                <span className="font-mono text-[9px] tracking-widest uppercase text-[#B08D57] mb-3 block">
                  {g.category}
                </span>
                <h2 className="font-display text-lg text-[#EDE6D6] mb-3 leading-snug group-hover:text-[#B08D57] transition-colors">
                  {g.title}
                </h2>
                <p className="text-sm text-[rgba(237,230,214,0.55)] leading-relaxed mb-5">{g.excerpt}</p>
                <div className="flex items-center justify-between pt-4 border-t border-[rgba(176,141,87,0.08)]">
                  <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.35)]">
                    <Clock className="w-3.5 h-3.5" aria-hidden /> {g.mins} min read
                  </span>
                  <ArrowRight className="w-4 h-4 text-[rgba(176,141,87,0.30)] group-hover:text-[#B08D57] transition-colors" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </SiteWrapper>
  );
}
