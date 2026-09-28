import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { AdminBookingsClient } from '@/components/admin/AdminBookingsClient';

export const metadata: Metadata = {
  title: 'Service Bookings Management',
  description: 'Manage luxury watch restoration requests, horologist dispatch, and atelier workflows',
};

export const dynamic = 'force-dynamic';

export default async function AdminServiceBookingsPage() {
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

  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
  const inProgressCount = bookings.filter(
    (b) => b.status === 'IN_PROGRESS' || b.status === 'TECHNICIAN_ASSIGNED' || b.status === 'TECHNICIAN_EN_ROUTE'
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(176,141,87,0.15)]">
        <div>
          <span className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] block mb-1">
            Atelier Operations
          </span>
          <h1 className="font-display text-2xl sm:text-3xl text-[#EDE6D6]">Watch Service Bookings</h1>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <span className="px-3 py-1.5 bg-amber-950/40 border border-amber-800/50 text-amber-300 font-mono text-xs rounded-[1px]">
              {pendingCount} Awaiting Horologist
            </span>
          )}
          <span className="font-mono text-xs text-[#B08D57] bg-[rgba(176,141,87,0.10)] border border-[rgba(176,141,87,0.20)] px-3 py-1.5 rounded-[1px]">
            {bookings.length} Total Bookings
          </span>
        </div>
      </div>

      <AdminBookingsClient
        initialBookings={bookings.map((b) => ({
          id: b.id,
          bookingReference: b.bookingReference,
          customer: b.customer,
          watchBrand: b.watchBrand,
          watchModel: b.watchModel,
          watchReferenceNumber: b.watchReferenceNumber,
          serviceType: b.serviceType,
          scheduledDate: b.scheduledDate,
          scheduledTimeStart: b.scheduledTimeStart,
          scheduledTimeEnd: b.scheduledTimeEnd,
          paymentStatus: b.paymentStatus,
          status: b.status,
          technicianId: b.technicianId,
          technician: b.technician,
        }))}
        technicians={technicianOptions}
      />
    </div>
  );
}
