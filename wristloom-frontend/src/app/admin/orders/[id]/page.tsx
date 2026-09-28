import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { OrderDetailClient } from '@/components/admin/OrderDetailClient';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Order Dossier',
  description: 'Manage luxury watch acquisition, shipping status, and payment verification',
};

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  const order = await db.order.findFirst({
    where: {
      OR: [{ id }, { orderReference: id }],
    },
    include: {
      orderItems: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return <OrderDetailClient order={order} />;
}
