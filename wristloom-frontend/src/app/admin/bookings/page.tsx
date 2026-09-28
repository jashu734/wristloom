import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Link from 'next/link';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { formatDate } from '@/lib/utils';

import { AdminBookingsClient } from '@/components/admin/AdminBookingsClient';

export const metadata: Metadata = { title: 'Admin — Bookings Management' };

export default async function AdminBookingsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/account');

  const [bookings, technicians] = await Promise.all([
    db.repairBooking.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        address: true,
        technician: { include: { user: { select: { name: true, phone: true } } } },
      },
    }),
    db.technician.findMany({
      select: {
        id: true,
        user: { select: { name: true } },
      },
    }),
  ]);

  const technicianOptions = technicians.map((t) => ({
    id: t.id,
    name: t.user.name || 'Technician',
  }));

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
          <AdminBookingsClient
            initialBookings={bookings.map((b) => ({
              id: b.id,
              bookingReference: b.bookingReference,
              customer: b.customer,
              watchBrand: b.watchBrand,
              watchModel: b.watchModel,
              watchReferenceNumber: b.watchReferenceNumber,
              serviceType: b.serviceType,
              scheduledDate: b.scheduledDate.toISOString(),
              scheduledTimeStart: b.scheduledTimeStart,
              scheduledTimeEnd: b.scheduledTimeEnd,
              paymentStatus: b.paymentStatus,
              status: b.status,
              technicianId: b.technicianId,
              technician: b.technician ? { id: b.technician.id, user: b.technician.user } : null,
            }))}
            technicians={technicianOptions}
          />
        </div>
      </div>
    </SiteWrapper>
  );
}
