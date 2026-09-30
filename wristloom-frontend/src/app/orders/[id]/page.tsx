import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { CustomerOrderDetailClient } from '@/components/orders/CustomerOrderDetailClient';
import { maskEmail, maskPhone, maskAddress } from '@/lib/privacy';

export const metadata: Metadata = {
  title: 'Order Details | Wristloom Atelier',
  description: 'View and track your timepiece acquisition order.',
};

interface OrderPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ track?: string }>;
}

export default async function OrderDetailPage({ params, searchParams }: OrderPageProps) {
  const { id } = await params;
  const { track } = await searchParams;

  const order = await db.order.findFirst({
    where: {
      OR: [
        { id },
        { orderReference: id },
      ],
    },
    include: {
      orderItems: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  });

  if (!order) {
    notFound();
  }

  const session = await auth();
  const isOwner = Boolean(session?.user?.id && order.userId === session.user.id);
  const isAdmin = session?.user?.role === 'ADMIN';

  // If order has an owner, verify ownership
  if (order.userId) {
    if (!session?.user) {
      redirect(`/login?callbackUrl=/orders/${id}`);
    }
    if (!isOwner && !isAdmin) {
      redirect('/account');
    }
  }

  // Parse structured tracking info from notes if present
  let trackingInfo: any = null;
  try {
    if (order.notes && (order.notes.startsWith('{') || order.notes.includes('"trackingNumber"'))) {
      trackingInfo = JSON.parse(order.notes);
    }
  } catch {
    // not json
  }

  const isGuestView = !isOwner && !isAdmin;

  const orderData = {
    ...order,
    shippingEmail: isGuestView ? maskEmail(order.shippingEmail) : order.shippingEmail,
    shippingPhone: isGuestView ? maskPhone(order.shippingPhone) : order.shippingPhone,
    shippingAddress: isGuestView ? maskAddress(order.shippingAddress as any) : order.shippingAddress,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    trackingInfo,
  };

  return (
    <CustomerOrderDetailClient
      order={orderData as any}
      initialTab={track === 'true' ? 'tracking' : 'details'}
    />
  );
}
