import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { BookingDetailClient } from '@/components/admin/BookingDetailClient';

interface ServiceBookingDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Service Booking Dossier',
  description: 'Manage watch restoration ticket, dispatch master horologist, and transition workflow state',
};

export const dynamic = 'force-dynamic';

export default async function ServiceBookingDetailPage({ params }: ServiceBookingDetailPageProps) {
  const { id } = await params;

  const [booking, technicians] = await Promise.all([
    db.repairBooking.findFirst({
      where: {
        OR: [{ id }, { bookingReference: id }],
      },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        address: true,
        technician: {
          include: {
            user: { select: { id: true, name: true, phone: true, profileImage: true } },
          },
        },
      },
    }),
    db.technician.findMany({
      include: {
        user: { select: { name: true } },
        bookings: { select: { id: true, status: true } },
      },
    }),
  ]);

  if (!booking) {
    notFound();
  }

  const availableTechnicians = technicians.map((t) => ({
    id: t.id,
    name: t.user.name || 'Master Horologist',
    specializations: t.specializations,
    rating: t.rating,
    isAvailable: t.isAvailable,
    activeJobs: t.bookings.filter((b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED').length,
  }));

  return <BookingDetailClient booking={booking} availableTechnicians={availableTechnicians} />;
}
