import { MOCK_TECHNICIANS, MOCK_REVIEWS } from '@/lib/mock-data';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { notFound } from 'next/navigation';
import { Star, Award, CheckCircle, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import Link from 'next/link';
import type { Metadata } from 'next';

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const tech = MOCK_TECHNICIANS.find((t) => t.id === id);
  if (!tech) return {};
  return { title: `${tech.name} — Certified Watchmaker`, description: tech.bio.slice(0, 160) };
}

export async function generateStaticParams() {
  return MOCK_TECHNICIANS.map((t) => ({ id: t.id }));
}

export default async function TechnicianProfilePage({ params }: Props) {
  const { id } = await params;
  const tech = MOCK_TECHNICIANS.find((t) => t.id === id);
  if (!tech) notFound();
  const reviews = MOCK_REVIEWS.filter((r) => r.technician_id === id);

  return (
    <SiteWrapper>
      <div className="min-h-screen bg-[#14110F]">
        {/* Back */}
        <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.08)]">
          <div className="container-wl py-4">
            <Link href="/technicians" className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] hover:text-[#B08D57] transition-colors">
              ← All Technicians
            </Link>
          </div>
        </div>

        <div className="container-wl py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10">

            {/* Sidebar */}
            <aside className="space-y-5">
              {/* Portrait */}
              <div className="aspect-square rounded-[2px] overflow-hidden border border-[rgba(176,141,87,0.15)]">
                <img src={tech.portrait_url} alt={tech.name} className="w-full h-full object-cover object-top" />
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Rating', value: String(tech.rating) },
                  { label: 'Services', value: tech.completed_services.toLocaleString() },
                  { label: 'Experience', value: `${tech.years_experience} yr` },
                  { label: 'Reviews', value: String(reviews.length) },
                ].map((s) => (
                  <div key={s.label} className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-3 text-center">
                    <p className="font-mono text-lg text-[#B08D57]">{s.value}</p>
                    <p className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.35)]">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Book */}
              <Button variant="oxblood" size="lg" className="w-full" asChild>
                <Link href="/services/repair">Book This Technician</Link>
              </Button>

              {/* Availability */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${tech.available ? 'bg-emerald-400' : 'bg-[rgba(237,230,214,0.25)]'}`} />
                <span className="font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.45)]">
                  {tech.available ? 'Currently available for bookings' : 'Fully booked — join waitlist'}
                </span>
              </div>

              {/* Brands */}
              <div>
                <h3 className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] mb-3">Brands Serviced</h3>
                <div className="flex flex-wrap gap-1.5">
                  {tech.brands_serviced.map((b) => (
                    <span key={b} className="font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.50)] bg-[rgba(176,141,87,0.06)] border border-[rgba(176,141,87,0.12)] px-2 py-1 rounded-[1px]">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main */}
            <div className="space-y-8">
              {/* Name + rating */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="font-display text-3xl md:text-4xl text-[#EDE6D6] tracking-tight">{tech.name}</h1>
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-[2px] border ${tech.available ? 'border-emerald-700/40 bg-emerald-900/20' : 'border-[rgba(237,230,214,0.12)]'}`}>
                    <Star className="w-3.5 h-3.5 text-[#B08D57] fill-[#B08D57]" aria-hidden />
                    <span className="font-mono text-sm text-[#B08D57]">{tech.rating}</span>
                  </div>
                </div>
                <p className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)]">
                  {tech.years_experience} Years · {tech.specializations[0]}
                </p>
              </div>

              {/* Bio */}
              <p className="text-[rgba(237,230,214,0.65)] leading-relaxed">{tech.bio}</p>

              {/* Certifications */}
              <div>
                <h2 className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] mb-4">
                  Certifications
                </h2>
                <div className="space-y-3">
                  {tech.certifications.map((cert) => (
                    <div key={cert.id} className="flex items-start gap-3 bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-4">
                      <Award className="w-5 h-5 text-[#B08D57] flex-shrink-0 mt-0.5" aria-hidden />
                      <div>
                        <p className="font-medium text-[#EDE6D6] text-sm">{cert.name}</p>
                        <p className="font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.40)] mt-0.5">
                          {cert.issuer} · Issued {new Date(cert.issued_at).getFullYear()}
                        </p>
                      </div>
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 ml-auto" aria-hidden />
                    </div>
                  ))}
                </div>
              </div>

              {/* Specializations */}
              <div>
                <h2 className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] mb-4">
                  Specializations
                </h2>
                <div className="flex flex-wrap gap-2">
                  {tech.specializations.map((s) => (
                    <span key={s} className="text-sm text-[rgba(237,230,214,0.65)] bg-[rgba(176,141,87,0.08)] border border-[rgba(176,141,87,0.15)] px-3 py-1.5 rounded-[2px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              {reviews.length > 0 && (
                <div>
                  <h2 className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] mb-4">
                    Customer Reviews ({reviews.length})
                  </h2>
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <article key={r.id} className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="flex gap-0.5 mb-1" aria-label={`${r.rating} stars`}>
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'text-[#B08D57] fill-[#B08D57]' : 'text-[rgba(176,141,87,0.20)]'}`} aria-hidden />
                              ))}
                            </div>
                            <h3 className="font-display text-base text-[#EDE6D6]">{r.title}</h3>
                          </div>
                          {r.verified && (
                            <span className="font-mono text-[9px] tracking-widest uppercase text-emerald-400 bg-emerald-900/20 border border-emerald-700/30 px-2 py-0.5 rounded-[1px] flex-shrink-0">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[rgba(237,230,214,0.55)] leading-relaxed mb-3">{r.body}</p>
                        <div className="flex items-center gap-4 font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.35)]">
                          <span>{r.customer_name}</span>
                          {r.watch_brand && <span>· {r.watch_brand}</span>}
                          <span>· {r.service_type}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SiteWrapper>
  );
}
