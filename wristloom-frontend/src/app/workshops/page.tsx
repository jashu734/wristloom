import type { Metadata } from 'next';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { MOCK_WORKSHOPS } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { Clock, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/primitives/Button';

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

        <div className="container-wl py-16 space-y-8">
          {MOCK_WORKSHOPS.map((ws) => {
            const spotsLeft = ws.max_participants - ws.current_participants;
            return (
              <article key={ws.id} className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] overflow-hidden">
                {/* Cover image */}
                <div className="aspect-[4/3] lg:aspect-auto overflow-hidden">
                  <img
                    src={ws.cover_image_url}
                    alt={ws.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="p-6 flex flex-col">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <span className={`font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-[1px] border mr-2 ${
                        ws.difficulty === 'Beginner' ? 'text-emerald-400 border-emerald-700/40 bg-emerald-900/20' :
                        ws.difficulty === 'Intermediate' ? 'text-amber-400 border-amber-700/40 bg-amber-900/20' :
                        'text-[#E8A0B0] border-[rgba(107,39,55,0.40)] bg-[rgba(107,39,55,0.20)]'
                      }`}>
                        {ws.difficulty}
                      </span>
                    </div>
                    <p className="font-mono text-lg text-[#B08D57] flex-shrink-0">
                      {formatCurrency(ws.price)}
                    </p>
                  </div>

                  <h2 className="font-display text-xl text-[#EDE6D6] mb-2">{ws.title}</h2>
                  <p className="text-sm text-[rgba(237,230,214,0.55)] leading-relaxed mb-4 flex-1">
                    {ws.description}
                  </p>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-4 mb-5 text-[rgba(237,230,214,0.45)]">
                    <span className="flex items-center gap-1.5 text-xs font-mono">
                      <Clock className="w-3.5 h-3.5" aria-hidden /> {ws.duration_hours}h session
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-mono">
                      <Users className="w-3.5 h-3.5" aria-hidden /> Max {ws.max_participants} participants
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-mono">
                      <Calendar className="w-3.5 h-3.5" aria-hidden /> {ws.dates.length} upcoming dates
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="mb-5">
                    <h3 className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] mb-2">
                      Upcoming Dates
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {ws.dates.slice(0, 3).map((d) => (
                        <div key={d.id} className="font-mono text-[10px] tracking-wider text-[rgba(237,230,214,0.55)] bg-[rgba(176,141,87,0.06)] border border-[rgba(176,141,87,0.12)] px-2 py-1 rounded-[1px]">
                          {new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {d.time}
                          <span className="text-[rgba(237,230,214,0.30)] ml-1">({d.spots_remaining} spots)</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructor + CTA */}
                  <div className="flex items-center justify-between gap-4 pt-4 border-t border-[rgba(176,141,87,0.08)]">
                    <p className="text-xs text-[rgba(237,230,214,0.45)]">
                      Instructor: <span className="text-[rgba(237,230,214,0.65)]">{ws.instructor_name}</span>
                    </p>
                    <Button variant="primary" size="sm" disabled={spotsLeft === 0}>
                      {spotsLeft > 0 ? `Book Workshop` : 'Sold Out'}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </SiteWrapper>
  );
}
