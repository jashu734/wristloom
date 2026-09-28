import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { CustomerDetailClient } from '@/components/admin/CustomerDetailClient';

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Customer Dossier',
  description: 'Collector transaction portfolio, address records, and service history',
};

export const dynamic = 'force-dynamic';

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;

  const customer = await db.user.findUnique({
    where: { id },
    include: {
      addresses: true,
      creditWallet: {
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      },
      orders: {
        orderBy: { createdAt: 'desc' },
        include: {
          orderItems: true,
        },
      },
      bookingsAsCustomer: {
        orderBy: { createdAt: 'desc' },
        include: {
          technician: {
            include: {
              user: { select: { name: true, phone: true } },
            },
          },
        },
      },
      watchVaultItems: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!customer) {
    notFound();
  }

  return <CustomerDetailClient customer={customer} />;
}
