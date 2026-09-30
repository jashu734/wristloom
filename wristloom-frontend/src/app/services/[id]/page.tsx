import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { CustomerServiceDetailClient } from '@/components/services/CustomerServiceDetailClient';

export const metadata: Metadata = {
  title: 'Service Dossier | Wristloom Atelier',
  description: 'View the complete horological service and restoration specifications.',
};

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const booking = await db.repairBooking.findFirst({
    where: {
      OR: [
        { id },
        { bookingReference: id },
      ],
    },
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      address: true,
      serviceHistory: { orderBy: { date: 'asc' } },
      technician: {
        include: {
          user: { select: { id: true, name: true, phone: true, profileImage: true, email: true } },
        },
      },
    },
  });

  if (!booking) {
    notFound();
  }

  const session = await auth();

  // Verify ownership if authenticated or guest
  if (booking.customerId) {
    if (!session?.user) {
      const isGuest = booking.customer.email.includes('guest@wristloom.luxury');
      if (!isGuest) {
        redirect(`/login?callbackUrl=/services/${id}`);
      }
    } else {
      const isOwner = booking.customerId === session.user.id;
      const isAdmin = session.user.role === 'ADMIN';
      const isTech = booking.technician?.userId === session.user.id;
      const isGuest = booking.customer.email.includes('guest@wristloom.luxury');
      if (!isOwner && !isAdmin && !isTech && !isGuest) {
        redirect('/account');
      }
    }
  }

  const bookingData = {
    ...booking,
    scheduledDate: booking.scheduledDate.toISOString(),
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    serviceHistory: booking.serviceHistory?.map((h) => ({
      ...h,
      date: h.date.toISOString(),
      createdAt: h.createdAt.toISOString(),
    })),
  };

  return <CustomerServiceDetailClient booking={bookingData as any} />;
}
