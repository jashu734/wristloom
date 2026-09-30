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

  const bLat = booking.address?.latitude && booking.address.latitude !== 0 ? booking.address.latitude : null;
  const bLng = booking.address?.longitude && booking.address.longitude !== 0 ? booking.address.longitude : null;
  const watchBrand = booking.watchBrand?.toLowerCase() || '';

  function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
  }

  const availableTechnicians = technicians
    .map((t) => {
      let distanceKm: number | null = null;
      if (bLat && bLng && t.currentLatitude && t.currentLongitude) {
        distanceKm = haversineKm(bLat, bLng, t.currentLatitude, t.currentLongitude);
      }
      const specs = (t.specializations || []).map((s) => s.toLowerCase());
      const brands = (t.brandsServiced || []).map((b) => b.toLowerCase());
      const isBrandSpecialist = Boolean(
        watchBrand && (specs.some((s) => s.includes(watchBrand)) || brands.some((b) => b.includes(watchBrand)))
      );
      const isRecommended = t.isAvailable && (isBrandSpecialist || (distanceKm !== null && distanceKm <= 35));

      return {
        id: t.id,
        name: t.user.name || 'Master Horologist',
        specializations: t.specializations,
        rating: t.rating,
        isAvailable: t.isAvailable,
        activeJobs: t.bookings.filter((b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED').length,
        distanceKm,
        isBrandSpecialist,
        isRecommended,
      };
    })
    .sort((a, b) => {
      if (a.isRecommended && !b.isRecommended) return -1;
      if (!a.isRecommended && b.isRecommended) return 1;
      if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
      return b.rating - a.rating;
    });

  return <BookingDetailClient booking={booking} availableTechnicians={availableTechnicians} />;
}
