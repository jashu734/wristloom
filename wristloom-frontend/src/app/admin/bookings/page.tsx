import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Link from 'next/link';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Admin — Bookings Management' };

export default async function AdminBookingsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/account');

  const bookings = await db.repairBooking.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { name: true, email: true, phone: true } },
      address: true,
      technician: { include: { user: { select: { name: true, phone: true } } } },
    },
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
              <h1 className="font-display text-3xl text-[#EDE6D6]">Repair Bookings</h1>
            </div>
            <span className="font-mono text-sm text-[#B08D57] bg-[rgba(176,141,87,0.10)] border border-[rgba(176,141,87,0.20)] px-3 py-1 rounded-[1px]">
              {bookings.length} Total Records
            </span>
          </div>
        </div>

        <div className="container-wl py-8">
          <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-[rgba(176,141,87,0.10)] bg-[rgba(20,17,15,0.40)]">
                    {['Reference', 'Customer', 'Watch Details', 'Service', 'Date & Slot', 'Payment', 'Status', 'Technician'].map((h) => (
                      <th key={h} className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(176,141,87,0.06)]">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[rgba(176,141,87,0.04)] transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-[#B08D57] font-medium whitespace-nowrap">
                        <Link href={`/service-tracking/${b.id}`} className="hover:underline">
                          {b.bookingReference}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[#EDE6D6] font-medium">{b.customer.name}</p>
                        <p className="text-xs text-[rgba(237,230,214,0.40)]">{b.customer.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-[#EDE6D6]">{b.watchBrand || '—'} {b.watchModel || ''}</p>
                        {b.watchReferenceNumber && (
                          <p className="font-mono text-[10px] text-[rgba(237,230,214,0.35)]">Ref: {b.watchReferenceNumber}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-[rgba(237,230,214,0.70)]">
                        {b.serviceType}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-mono text-[11px] text-[#EDE6D6]">{formatDate(b.scheduledDate)}</p>
                        <p className="font-mono text-[10px] text-[rgba(237,230,214,0.40)]">{b.scheduledTimeStart} – {b.scheduledTimeEnd}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-[1px] border ${
                          b.paymentStatus === 'DEPOSIT_PAID' || b.paymentStatus === 'FULLY_PAID'
                            ? 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40'
                            : 'text-amber-400 bg-amber-950/30 border-amber-800/40'
                        }`}>
                          {b.paymentStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[#EDE6D6]">
                          {b.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[rgba(237,230,214,0.60)] whitespace-nowrap">
                        {b.technician?.user.name ?? 'Unassigned'}
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-[rgba(237,230,214,0.40)] italic">
                        No repair bookings recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </SiteWrapper>
  );
}
