import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Link from 'next/link';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { Star, ShieldCheck, Wrench } from 'lucide-react';

export const metadata: Metadata = { title: 'Admin — Technician Roster' };

export default async function AdminTechniciansPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/account');

  const technicians = await db.technician.findMany({
    include: {
      user: { select: { name: true, email: true, phone: true, profileImage: true } },
      bookings: { select: { id: true, status: true } },
    },
    orderBy: { rating: 'desc' },
  });

  return (
    <SiteWrapper>
      <div className="min-h-screen bg-[#14110F]">
        <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
          <div className="container-wl py-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href="/admin" className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] hover:text-[#B08D57]">
                  ← Control Centre
                </Link>
              </div>
              <h1 className="font-display text-3xl text-[#EDE6D6]">Technician Roster</h1>
            </div>
            <span className="font-mono text-sm text-[#B08D57] bg-[rgba(176,141,87,0.10)] border border-[rgba(176,141,87,0.20)] px-3 py-1 rounded-[1px]">
              {technicians.length} Master Watchmakers
            </span>
          </div>
        </div>

        <div className="container-wl py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technicians.map((t) => {
              const activeJobs = t.bookings.filter((b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED').length;
              return (
                <div key={t.id} className="bg-[#1E1A17] border border-[rgba(176,141,87,0.12)] rounded-[2px] p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-lg text-[#EDE6D6]">{t.user.name}</h3>
                      <p className="text-xs text-[rgba(237,230,214,0.45)]">{t.user.email}</p>
                      <p className="font-mono text-[11px] text-[#B08D57] mt-0.5">{t.user.phone || '—'}</p>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-sm text-[#B08D57]">
                      <Star className="w-3.5 h-3.5 fill-[#B08D57] text-[#B08D57]" />
                      {t.rating.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {t.specializations.map((s) => (
                      <span key={s} className="font-mono text-[9px] tracking-wider uppercase text-[rgba(237,230,214,0.50)] bg-[rgba(176,141,87,0.08)] border border-[rgba(176,141,87,0.15)] px-2 py-0.5 rounded-[1px]">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-[rgba(176,141,87,0.08)] grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="font-mono text-xs text-[#EDE6D6]">{t.yearsExperience}y</span>
                      <p className="font-mono text-[8px] uppercase tracking-widest text-[rgba(237,230,214,0.30)]">Experience</p>
                    </div>
                    <div>
                      <span className="font-mono text-xs text-[#EDE6D6]">{t.completedServices}</span>
                      <p className="font-mono text-[8px] uppercase tracking-widest text-[rgba(237,230,214,0.30)]">Completed</p>
                    </div>
                    <div>
                      <span className={`font-mono text-xs ${activeJobs > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{activeJobs}</span>
                      <p className="font-mono text-[8px] uppercase tracking-widest text-[rgba(237,230,214,0.30)]">Active Jobs</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-[1px] border ${
                      t.isAvailable
                        ? 'text-emerald-400 border-emerald-800/40 bg-emerald-950/20'
                        : 'text-[rgba(237,230,214,0.35)] border-[rgba(237,230,214,0.15)] bg-[rgba(20,17,15,0.40)]'
                    }`}>
                      {t.isAvailable ? 'Available' : 'Offline'}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-400/80 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SiteWrapper>
  );
}
