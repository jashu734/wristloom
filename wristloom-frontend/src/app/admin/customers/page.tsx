import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { AdminCustomersClient } from '@/components/admin/AdminCustomersClient';

export const metadata: Metadata = {
  title: 'Customer Directory',
  description: 'Manage verified watch collectors, client portfolios, and purchase histories',
};

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const users = await db.user.findMany({
    where: { role: 'CUSTOMER' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      profileImage: true,
      createdAt: true,
      creditWallet: { select: { balance: true } },
      orders: {
        select: {
          id: true,
          totalAmount: true,
          status: true,
          paymentStatus: true,
        },
      },
      bookingsAsCustomer: {
        select: {
          id: true,
          status: true,
        },
      },
      addresses: {
        take: 1,
        select: {
          city: true,
        },
      },
    },
  });

  const formatted = users.map((c) => {
    const totalSpent = c.orders
      .filter((o) => o.paymentStatus === 'FULLY_PAID' || o.paymentStatus === 'DEPOSIT_PAID')
      .reduce((acc, curr) => acc + curr.totalAmount, 0);

    return {
      id: c.id,
      name: c.name || 'Anonymous Client',
      email: c.email,
      phone: c.phone || '—',
      profileImage: c.profileImage,
      joinedDate: c.createdAt.toISOString(),
      ordersCount: c.orders.length,
      totalSpent,
      bookingsCount: c.bookingsAsCustomer.length,
      walletBalance: c.creditWallet?.balance ?? 0,
      city: c.addresses[0]?.city || '—',
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(176,141,87,0.15)]">
        <div>
          <span className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] block mb-1">
            Clientele & Collectors
          </span>
          <h1 className="font-display text-2xl sm:text-3xl text-[#EDE6D6]">Customer Directory</h1>
        </div>
        <span className="font-mono text-xs text-[#B08D57] bg-[rgba(176,141,87,0.10)] border border-[rgba(176,141,87,0.20)] px-3 py-1.5 rounded-[1px]">
          {formatted.length} Registered Collectors
        </span>
      </div>

      <AdminCustomersClient initialCustomers={formatted} />
    </div>
  );
}
