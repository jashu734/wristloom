import type { Metadata } from 'next';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { MOCK_INVESTMENT_INSIGHTS } from '@/lib/mock-data';
import { Clock, AlertTriangle, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Investment Insights',
  description: 'Educational market analysis on luxury watch values, brand trajectories, and collector demand. For informational purposes only.',
};

export default function InvestmentInsightsPage() {
  return (
    <SiteWrapper>
      <div className="min-h-screen bg-[#14110F]">
        <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
          <div className="container-wl py-16">
            <span className="text-overline block mb-3">The Atelier</span>
            <h1 className="font-display text-4xl md:text-5xl text-[#EDE6D6] tracking-tight mb-4">
              Investment Insights
            </h1>
            <p className="text-[rgba(237,230,214,0.60)] max-w-xl leading-relaxed">
              Market analysis and educational perspectives on the luxury watch secondary market. Our goal is informed collecting, not speculation.
            </p>
          </div>
        </div>

        <div className="container-wl py-16">
          {/* Disclaimer banner */}
          <div className="flex items-start gap-3 bg-[rgba(176,141,87,0.06)] border border-[rgba(176,141,87,0.20)] rounded-[2px] p-4 mb-10">
            <AlertTriangle className="w-4 h-4 text-[#B08D57] flex-shrink-0 mt-0.5" aria-hidden />
            <p className="text-xs text-[rgba(237,230,214,0.60)] leading-relaxed">
              <strong className="text-[rgba(237,230,214,0.80)]">Educational content only.</strong>{' '}
              Wristloom does not provide investment advice. Watch values can decrease as well as increase. Past performance does not predict future results. Always consult a qualified financial adviser before making decisions based on watch market data.
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

            {/* Additional realistic insight cards */}
            {[
              { brand: 'Audemars Piguet', title: 'Royal Oak at 50 — how a "mistake" became the template for luxury sport watches', excerpt: 'Gérald Genta was given one night to design the Royal Oak. The resulting watch redefined an industry.', mins: 10 },
              { brand: 'Patek Philippe', title: 'Understanding why Patek Philippe holds value differently from other brands', excerpt: 'The Geneva Seal, vertical integration, and family ownership — why Patek operates on different principles.', mins: 8 },
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
