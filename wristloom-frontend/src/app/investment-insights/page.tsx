import type { Metadata } from 'next';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { MOCK_INVESTMENT_INSIGHTS } from '@/lib/mock-data';
import { Clock, BookOpen, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Horological Journal — Wristloom Atelier',
  description: 'Archival perspectives, craftsmanship chronicles, and mechanical design stories from fine watchmaking history.',
};

export default function InvestmentInsightsPage() {
  return (
    <SiteWrapper>
      <div className="min-h-screen bg-[#14110F]">
        <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
          <div className="container-wl py-16">
            <span className="text-overline block mb-3">The Atelier Journal</span>
            <h1 className="font-display text-4xl md:text-5xl text-[#EDE6D6] tracking-tight mb-4">
              Horological Journal
            </h1>
            <p className="text-[rgba(237,230,214,0.60)] max-w-xl leading-relaxed">
              Archival perspectives and design chronicles from the world of fine watchmaking. Dedicated to mechanical craftsmanship, historic references, and horological preservation.
            </p>
          </div>
        </div>

        <div className="container-wl py-16">
          {/* Atelier Heritage banner */}
          <div className="flex items-start gap-3 bg-[rgba(176,141,87,0.06)] border border-[rgba(176,141,87,0.20)] rounded-[2px] p-4 mb-10">
            <BookOpen className="w-4 h-4 text-[#B08D57] flex-shrink-0 mt-0.5" aria-hidden />
            <p className="text-xs text-[rgba(237,230,214,0.60)] leading-relaxed">
              <strong className="text-[rgba(237,230,214,0.80)]">The Horological Archive.</strong>{' '}
              The Wristloom Journal chronicles the history, movement mechanics, and restoration traditions of iconic horological houses for enthusiasts and collectors worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {MOCK_INVESTMENT_INSIGHTS.map((insight) => (
              <article key={insight.id} className="group bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] hover:border-[rgba(176,141,87,0.25)] rounded-[2px] p-6 transition-all duration-300 cursor-pointer">
                {insight.brand_focus && (
                  <span className="font-mono text-[9px] tracking-widest uppercase text-[#B08D57] mb-3 block">
                    {insight.brand_focus}
                  </span>
                )}
                <h2 className="font-display text-xl text-[#EDE6D6] mb-3 leading-snug group-hover:text-[#B08D57] transition-colors">
                  {insight.title}
                </h2>
                <p className="text-sm text-[rgba(237,230,214,0.55)] leading-relaxed mb-5">{insight.excerpt}</p>
                <div className="flex items-center justify-between pt-4 border-t border-[rgba(176,141,87,0.08)]">
                  <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.35)]">
                    <Clock className="w-3.5 h-3.5" aria-hidden />
                    {insight.read_time_minutes} min read
                  </span>
                  <ArrowRight className="w-4 h-4 text-[rgba(176,141,87,0.30)] group-hover:text-[#B08D57] transition-colors" />
                </div>
              </article>
            ))}

            {/* Additional realistic chronicle cards */}
            {[
              { brand: 'Audemars Piguet', title: 'Royal Oak Architectural Origins — Gérald Genta’s Geometry', excerpt: 'How an avant-garde octagonal bezel and integrated bracelet design redefined modern luxury sport horology.', mins: 10 },
              { brand: 'Patek Philippe', title: 'The Geneva Seal & Haute Horlogerie Finishing Traditions', excerpt: 'From anglage to Côtes de Genève: examining the rigorous artisanal requirements of the Patek Philippe seal.', mins: 8 },
            ].map((insight, i) => (
              <article key={i} className="group bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] hover:border-[rgba(176,141,87,0.25)] rounded-[2px] p-6 transition-all duration-300 cursor-pointer">
                <span className="font-mono text-[9px] tracking-widest uppercase text-[#B08D57] mb-3 block">
                  {insight.brand}
                </span>
                <h2 className="font-display text-xl text-[#EDE6D6] mb-3 leading-snug group-hover:text-[#B08D57] transition-colors">
                  {insight.title}
                </h2>
                <p className="text-sm text-[rgba(237,230,214,0.55)] leading-relaxed mb-5">{insight.excerpt}</p>
                <div className="flex items-center justify-between pt-4 border-t border-[rgba(176,141,87,0.08)]">
                  <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.35)]">
                    <Clock className="w-3.5 h-3.5" aria-hidden /> {insight.mins} min read
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
