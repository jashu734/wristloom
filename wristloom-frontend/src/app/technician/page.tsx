import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { TechnicianDashboard } from '@/components/technician/TechnicianDashboard';

export const metadata: Metadata = {
  title: 'Technician Dashboard',
  description: 'Wristloom certified technician portal — view bookings, manage status, and navigate to customers.',
};

export default async function TechnicianPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/technician');
  if (session.user.role !== 'TECHNICIAN' && session.user.role !== 'ADMIN') {
    redirect('/account');
  }

  const tech = await db.technician.findUnique({
    where: { userId: session.user.id },
    select: { id: true, isAvailable: true },
  });

  const rawBookings = tech?.id
    ? await db.repairBooking.findMany({
        where: { technicianId: tech.id },
        orderBy: { scheduledDate: 'desc' },
        include: {
          customer: { select: { id: true, name: true, phone: true, profileImage: true } },
          address: true,
        },
      })
    : [];

  const initialBookings = rawBookings.map((b: any) => ({
    ...b,
    scheduledDate: b.scheduledDate instanceof Date ? b.scheduledDate.toISOString() : b.scheduledDate,
    customer: {
      name: b.customer?.name || 'Customer',
      phone: b.customer?.phone || '',
      profileImage: b.customer?.profileImage || undefined,
    },
    address: b.address
      ? {
          formattedAddress: b.address.formattedAddress || b.address.addressLine1,
          addressLine2: b.address.addressLine2 || undefined,
          latitude: b.address.latitude,
          longitude: b.address.longitude,
          fullName: b.address.fullName,
          phone: b.address.phone,
        }
      : undefined,
  }));

  return (
    <TechnicianDashboard
      userId={session.user.id}
      userName={session.user.name ?? 'Technician'}
      initialBookings={initialBookings}
      initialTechId={tech?.id ?? null}
      initialAvailable={tech?.isAvailable ?? true}
    />
  );
}
