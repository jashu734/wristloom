import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { LiveTrackingClient } from '@/components/tracking/LiveTrackingClient';

export const metadata: Metadata = {
  title: 'Track Your Service',
  description: 'Track your Wristloom technician in real time.',
};

export default async function ServiceTrackingPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;

  // Support demo / preview tracking mode
  if (bookingId === 'demo' || bookingId.toLowerCase().startsWith('wl-demo')) {
    return (
      <LiveTrackingClient
        booking={{
          id: 'demo-booking-001',
          reference: 'WL-DEMO-2026',
          serviceType: 'Complete Overhaul & Regulation',
          status: 'TECHNICIAN_EN_ROUTE',
          address: {
            formattedAddress: 'Altamount Road, Cumballa Hill, Mumbai 400026',
            latitude: 18.9667,
            longitude: 72.8081,
          },
          technician: {
            id: 'tech-001',
            name: 'Arjun Mehta',
            profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=85',
            rating: 4.95,
            specializations: ['Rolex Certified', 'Patek Philippe Complications', 'Tourbillon Regulation'],
            currentLatitude: 18.9720,
            currentLongitude: 72.8120,
          },
        }}
      />
    );
  }

  let booking = null;
  try {
    booking = await db.repairBooking.findFirst({
      where: {
        OR: [
          { id: bookingId },
          { bookingReference: bookingId },
        ],
      },
      include: {
        technician: {
          include: {
            user: { select: { name: true, profileImage: true } },
          },
        },
        address: true,
        customer: { select: { id: true, name: true, email: true } },
      },
    });
  } catch (err) {
    console.error('Error fetching booking:', err);
  }

  if (!booking) notFound();

  const session = await auth();

  // If customer is logged in, verify access unless admin or assigned technician
  if (session?.user) {
    const isOwner = booking.customerId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    const isAssignedTech = booking.technician?.userId === session.user.id;
    const isGuestBooking = booking.customer.email.includes('guest@wristloom.luxury');
    if (!isOwner && !isAdmin && !isAssignedTech && !isGuestBooking) {
      redirect('/account');
    }
  }

  return (
    <LiveTrackingClient
      booking={{
        id: booking.id,
        reference: booking.bookingReference,
        serviceType: booking.serviceType,
        status: booking.status,
        address: booking.address
          ? {
              formattedAddress: booking.address.formattedAddress,
              latitude: booking.address.latitude,
              longitude: booking.address.longitude,
            }
          : null,
        technician: booking.technician
          ? {
              id: booking.technician.id,
              name: booking.technician.user.name ?? 'Technician',
              profileImage: booking.technician.user.profileImage ?? null,
              rating: booking.technician.rating,
              specializations: booking.technician.specializations,
              currentLatitude: booking.technician.currentLatitude,
              currentLongitude: booking.technician.currentLongitude,
            }
          : null,
      }}
    />
  );
}
