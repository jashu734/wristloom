import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { AdminOrdersClient } from '@/components/admin/AdminOrdersClient';

export const metadata: Metadata = {
  title: 'Order & Payment Management',
  description: 'Track luxury watch acquisitions, concierge shipping, and payment settlements',
};

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      orderItems: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(176,141,87,0.15)]">
        <div>
          <span className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] block mb-1">
            Sales & Commerce
          </span>
          <h1 className="font-display text-2xl sm:text-3xl text-[#EDE6D6]">Acquisitions & Orders</h1>
        </div>
        <span className="font-mono text-xs text-[#B08D57] bg-[rgba(176,141,87,0.10)] border border-[rgba(176,141,87,0.20)] px-3 py-1.5 rounded-[1px]">
          {orders.length} Total Orders
        </span>
      </div>

      <AdminOrdersClient initialOrders={orders} />
    </div>
  );
}
