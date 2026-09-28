import type { Metadata } from 'next';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { MOCK_TESTIMONIALS } from '@/lib/mock-data';
import { Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Testimonials',
  description: 'Stories from Wristloom collectors — repair experiences, authentication journeys, and long-term relationships with their timepieces.',
};

export default function TestimonialsPage() {
  const featured = MOCK_TESTIMONIALS.filter((t) => t.featured);
  const rest = MOCK_TESTIMONIALS.filter((t) => !t.featured);

  return (
    <SiteWrapper>
      <div className="min-h-screen bg-[#14110F]">
        {/* Header */}
        <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
          <div className="container-wl py-16">
            <span className="text-overline block mb-3">Collector Stories</span>
            <h1 className="font-display text-4xl md:text-5xl text-[#EDE6D6] tracking-tight">
              In Their Own Words
            </h1>
          </div>
        </div>

        <div className="container-wl py-16 space-y-16">

          {/* Featured — large editorial cards */}
          <div className="space-y-6">
            <span className="text-overline">Featured</span>
            {featured.map((t, i) => (
              <article
                key={t.id}
                className={`grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] overflow-hidden p-6 md:p-8 ${
                  i % 2 === 1 ? 'md:grid-cols-[2fr_1fr]' : ''
                }`}
              >
                <div className="flex flex-col justify-between">
                  {/* Author */}
                  <div className="flex items-center gap-3 mb-6">
                    {t.customer_avatar ? (
                      <img src={t.customer_avatar} alt={t.customer_name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[rgba(176,141,87,0.15)] flex items-center justify-center font-mono text-sm text-[#B08D57]">
                        {t.customer_name[0]}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-[#EDE6D6]">{t.customer_name}</p>
                      <p className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)]">
                        {t.customer_location} · {t.service_type}
                      </p>
                    </div>
                  </div>
                  {/* Stars */}
                  <div className="flex gap-0.5" aria-label={`${t.rating} stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < t.rating ? 'text-[#B08D57] fill-[#B08D57]' : 'text-[rgba(176,141,87,0.20)]'}`} aria-hidden />
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="font-display text-2xl text-[#EDE6D6] mb-4 leading-snug">
                    &ldquo;{t.title}&rdquo;
                  </h2>
                  <p className="text-[rgba(237,230,214,0.60)] leading-relaxed">{t.body}</p>
                  {t.watch_brand && (
                    <p className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] mt-4">
                      {t.watch_brand}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* Rest — 2-column grid */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {rest.map((t) => (
                <article key={t.id} className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-6">
                  <div className="flex gap-0.5 mb-3" aria-label={`${t.rating} stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < t.rating ? 'text-[#B08D57] fill-[#B08D57]' : 'text-[rgba(176,141,87,0.20)]'}`} aria-hidden />
                    ))}
                  </div>
                  <h3 className="font-display text-lg text-[#EDE6D6] mb-3">&ldquo;{t.title}&rdquo;</h3>
                  <p className="text-sm text-[rgba(237,230,214,0.55)] leading-relaxed mb-4">{t.body}</p>
                  <p className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.35)]">
                    {t.customer_name} · {t.customer_location}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteWrapper>
  );
}
