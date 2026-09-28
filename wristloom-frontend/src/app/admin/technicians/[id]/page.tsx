import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { TechnicianDetailClient } from '@/components/admin/TechnicianDetailClient';

interface TechnicianDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Horologist Dossier',
  description: 'Manage master watchmaker certifications, service records, and job dispatching',
};

export const dynamic = 'force-dynamic';

export default async function TechnicianDetailPage({ params }: TechnicianDetailPageProps) {
  const { id } = await params;

  const technician = await db.technician.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profileImage: true,
        },
      },
      bookings: {
        orderBy: { createdAt: 'desc' },
      },
      reviews: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!technician) {
    notFound();
  }

  return <TechnicianDetailClient technician={technician} />;
}
