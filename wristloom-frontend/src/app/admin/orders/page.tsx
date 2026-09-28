import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import Link from 'next/link';
import { AdminOrdersClient } from '@/components/admin/AdminOrdersClient';

export const metadata: Metadata = { title: 'Admin — Order Management' };

export default async function AdminOrdersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/account');

  const orders = await db.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      orderItems: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  });

  return (
    <SiteWrapper>
      <div className="min-h-screen bg-[#14110F]">
        <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
          <div className="container-wl py-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href="/admin" className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] hover:text-[#B08D57]">
                  ← Control Centre
                </Link>
              </div>
              <h1 className="font-display text-3xl text-[#EDE6D6]">Timepiece Orders & Deliveries</h1>
            </div>
            <span className="font-mono text-sm text-[#B08D57] bg-[rgba(176,141,87,0.10)] border border-[rgba(176,141,87,0.20)] px-3 py-1 rounded-[1px]">
              {orders.length} Acquisition Records
            </span>
          </div>
        </div>

        <div className="container-wl py-8">
          <AdminOrdersClient initialOrders={orders} />
        </div>
      </div>
    </SiteWrapper>
  );
}
