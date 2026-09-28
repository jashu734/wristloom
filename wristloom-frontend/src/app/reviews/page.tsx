import type { Metadata } from 'next';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { db } from '@/lib/db';
import { MOCK_REVIEWS, MOCK_TECHNICIANS } from '@/lib/mock-data';
import { Star } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Service Reviews',
  description: 'Read verified customer reviews for Wristloom\'s certified technicians. Filter by technician to find the right specialist for your watch.',
};

export default async function ReviewsPage() {
  let dbReviews: any[] = [];
  try {
    dbReviews = await db.review.findMany({
      where: { verified: true },
      include: {
        customer: { select: { name: true } },
        technician: {
          include: {
            user: { select: { name: true, profileImage: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (e) {
    console.warn('DB reviews fetch error:', e);
  }

  const hasDbReviews = dbReviews.length > 0;
  return (
    <SiteWrapper>
      <div className="min-h-screen bg-[#14110F]">
        <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
          <div className="container-wl py-16">
            <span className="text-overline block mb-3">Verified Feedback</span>
            <h1 className="font-display text-4xl md:text-5xl text-[#EDE6D6] tracking-tight">
              Service Reviews
            </h1>
          </div>
        </div>

        <div className="container-wl py-12">
          {/* Aggregate stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { value: '4.93', label: 'Average Rating' },
              { value: '2,032', label: 'Total Reviews' },
              { value: '98.7%', label: 'Recommend Rate' },
              { value: '100%', label: 'Verified' },
            ].map((s) => (
              <div key={s.label} className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-5 text-center">
                <p className="font-mono text-2xl text-[#B08D57] mb-1">{s.value}</p>
                <p className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)]">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Database Reviews if available */}
          {hasDbReviews && (
            <div className="mb-12">
              <h2 className="font-display text-2xl text-[#EDE6D6] mb-6">Recent Verified Client Feedback</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dbReviews.map((r) => (
                  <article key={r.id} className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex gap-0.5" aria-label={`${r.rating} stars`}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'text-[#B08D57] fill-[#B08D57]' : 'text-[rgba(176,141,87,0.20)]'}`} aria-hidden />
                        ))}
                      </div>
                      <span className="font-mono text-[9px] tracking-widest uppercase text-emerald-400 bg-emerald-900/20 border border-emerald-700/30 px-1.5 py-0.5 rounded-[1px]">
                        Verified Service
                      </span>
                    </div>
                    <h3 className="font-display text-base text-[#EDE6D6] mb-2">{r.title}</h3>
                    <p className="text-sm text-[rgba(237,230,214,0.55)] leading-relaxed mb-3">{r.body}</p>
                    <div className="font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.40)] flex items-center justify-between pt-2 border-t border-[rgba(176,141,87,0.08)]">
                      <span>{r.customer.name || 'Client'} {r.watchBrand ? `· ${r.watchBrand}` : ''} · {r.serviceType}</span>
                      <span className="text-[#B08D57]">Tech: {r.technician.user.name}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Curated launch reviews */}
          {!hasDbReviews && MOCK_TECHNICIANS.map((tech) => {
            const techReviews = MOCK_REVIEWS.filter((r) => r.technician_id === tech.id);
            if (techReviews.length === 0) return null;
            return (
              <div key={tech.id} className="mb-12">
                <div className="flex items-center gap-4 mb-5">
                  <img src={tech.portrait_url} alt={tech.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <Link href={`/technicians/${tech.id}`} className="font-display text-lg text-[#EDE6D6] hover:text-[#B08D57] transition-colors">
                      {tech.name}
                    </Link>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Star className="w-3 h-3 text-[#B08D57] fill-[#B08D57]" aria-hidden />
                      <span className="font-mono text-xs text-[#B08D57]">{tech.rating}</span>
                      <span className="font-mono text-[10px] text-[rgba(237,230,214,0.35)] uppercase tracking-wider">
                        · {tech.completed_services} services
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {techReviews.map((r) => (
                    <article key={r.id} className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex gap-0.5" aria-label={`${r.rating} stars`}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'text-[#B08D57] fill-[#B08D57]' : 'text-[rgba(176,141,87,0.20)]'}`} aria-hidden />
                          ))}
                        </div>
                        {r.verified && (
                          <span className="font-mono text-[9px] tracking-widest uppercase text-emerald-400 bg-emerald-900/20 border border-emerald-700/30 px-1.5 py-0.5 rounded-[1px]">
                            Verified
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-base text-[#EDE6D6] mb-2">{r.title}</h3>
                      <p className="text-sm text-[rgba(237,230,214,0.55)] leading-relaxed mb-3">{r.body}</p>
                      <div className="font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.35)]">
                        {r.customer_name}
                        {r.watch_brand && ` · ${r.watch_brand}`}
                        {` · ${r.service_type}`}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SiteWrapper>
  );
}
