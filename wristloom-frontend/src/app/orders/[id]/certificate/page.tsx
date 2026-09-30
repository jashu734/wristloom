import * as React from 'react';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { isUserAdmin } from '@/lib/roles';
import { CertificateClient } from './CertificateClient';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Certificate of Horological Authenticity — ${id} — Wristloom`,
    description: 'Official Atelier Provenance & Technical Authenticity Passport issued by Wristloom.',
  };
}

export default async function OrderCertificatePage({ params }: Props) {
  const { id } = await params;

  // Find order by ID or orderReference
  const order = await db.order.findFirst({
    where: {
      OR: [
        { id },
        { orderReference: id },
      ],
    },
    include: {
      orderItems: true,
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const session = await auth();

  // Enforce ownership: only owner, matching guest email, or admin can access passport certificate
  const isAdmin = isUserAdmin(session?.user);
  const isOwner = Boolean(session?.user?.id && order.userId && session.user.id === order.userId);
  const isMatchingGuest = Boolean(
    !order.userId &&
    session?.user?.email &&
    order.shippingEmail &&
    session.user.email.toLowerCase() === order.shippingEmail.toLowerCase()
  );

  if (!isAdmin && !isOwner && !isMatchingGuest) {
    if (!session?.user) {
      redirect(`/login?callbackUrl=/orders/${id}/certificate`);
    }
    redirect('/account');
  }

  return (
    <CertificateClient order={order} />
  );
}
