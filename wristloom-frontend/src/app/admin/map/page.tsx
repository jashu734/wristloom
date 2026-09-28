import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Link from 'next/link';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { MapPin, Navigation, Clock } from 'lucide-react';

export const metadata: Metadata = { title: 'Admin — Live Fleet Radar' };

export default async function AdminMapPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/account');

  const [activeBookings, activeTechs] = await Promise.all([
    db.repairBooking.findMany({
      where: { status: { in: ['CONFIRMED', 'TECHNICIAN_EN_ROUTE', 'TECHNICIAN_ARRIVED', 'IN_PROGRESS'] } },
      include: {
        customer: { select: { name: true, phone: true } },
        address: true,
        technician: { include: { user: { select: { name: true, phone: true } } } },
      },
      orderBy: { scheduledDate: 'asc' },
    }),
    db.technician.findMany({
      where: { isAvailable: true },
      include: { user: { select: { name: true, phone: true } } },
    }),
  ]);

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
              <h1 className="font-display text-3xl text-[#EDE6D6]">Dispatch & Fleet Radar</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-mono text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 px-3 py-1 rounded-[1px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Telemetry Active
              </span>
            </div>
          </div>
        </div>

        <div className="container-wl py-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.12)] rounded-[2px] p-5 lg:col-span-1 space-y-4">
              <h2 className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)]">
                Active Service Jobs ({activeBookings.length})
              </h2>

              <div className="space-y-3">
                {activeBookings.map((b) => (
                  <div key={b.id} className="bg-[#14110F] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-[#B08D57] font-semibold">{b.bookingReference}</span>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-[1px] border border-emerald-800/40">
                        {b.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="text-sm text-[#EDE6D6] font-medium">{b.serviceType}</p>
                    <p className="text-xs text-[rgba(237,230,214,0.50)]">{b.customer.name} · {b.customer.phone || 'No phone'}</p>

                    <div className="flex items-center gap-1.5 text-xs text-[rgba(237,230,214,0.40)] pt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#B08D57]" />
                      <span className="truncate">{b.address?.formattedAddress ?? 'Atelier Service'}</span>
                    </div>

                    <div className="pt-2 border-t border-[rgba(176,141,87,0.08)] flex items-center justify-between">
                      <span className="text-xs text-[rgba(237,230,214,0.50)]">
                        Tech: {b.technician?.user.name ?? 'Unassigned'}
                      </span>
                      <Link
                        href={`/service-tracking/${b.id}`}
                        className="font-mono text-[10px] uppercase tracking-wider text-[#B08D57] hover:underline flex items-center gap-1"
                      >
                        Radar View →
                      </Link>
                    </div>
                  </div>
                ))}

                {activeBookings.length === 0 && (
                  <p className="text-xs text-[rgba(237,230,214,0.40)] italic py-4 text-center">
                    No active in-flight service calls at this moment.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.12)] rounded-[2px] p-6 lg:col-span-2 flex flex-col justify-between">
              <div>
                <h2 className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] mb-4">
                  Master Watchmakers on Duty ({activeTechs.length})
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeTechs.map((t) => (
                    <div key={t.id} className="bg-[#14110F] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[#EDE6D6] font-medium text-sm">{t.user.name}</p>
                        <p className="font-mono text-[10px] text-[rgba(237,230,214,0.40)] mt-0.5">
                          GPS: {t.currentLatitude?.toFixed(4) ?? '12.9716'}, {t.currentLongitude?.toFixed(4) ?? '77.5946'}
                        </p>
                      </div>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 px-2 py-1 rounded-[1px]">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[rgba(176,141,87,0.10)]">
                <div className="bg-[rgba(20,17,15,0.80)] border border-[rgba(176,141,87,0.20)] rounded-[2px] p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Navigation className="w-5 h-5 text-[#B08D57]" />
                    <div>
                      <h3 className="font-display text-base text-[#EDE6D6]">Interactive Customer Map View</h3>
                      <p className="text-xs text-[rgba(237,230,214,0.50)]">
                        Launch the customer-facing radar tracking dashboard to test live Leaflet route polylines.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/service-tracking"
                    className="font-mono text-[10px] tracking-widest uppercase bg-[#B08D57] text-[#14110F] px-4 py-2 rounded-[1px] font-bold hover:bg-[#c4a16b] transition-colors"
                  >
                    Open Live Portal
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteWrapper>
  );
}
