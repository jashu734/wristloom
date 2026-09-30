import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { AdminNotificationsClient } from '@/components/admin/AdminNotificationsClient';
import { formatCurrency } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Administrative Notifications',
  description: 'Live system alerts, order updates, booking dispatches, and inventory warnings',
};

export const dynamic = 'force-dynamic';

export default async function AdminNotificationsPage() {
  const session = await auth();

  const [userNotifications, pendingBookings, pendingOrders, lowStockCount] = await Promise.all([
    session?.user?.id
      ? db.notification.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: 'desc' },
          take: 20,
        })
      : Promise.resolve([]),
    db.repairBooking.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { customer: { select: { name: true } } },
    }),
    db.order.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    db.product.count({ where: { stockCount: { lte: 2 } } }),
  ]);

  const systemAlerts = [];

  if (lowStockCount > 0) {
    systemAlerts.push({
      id: 'sys_low_stock',
      title: 'Inventory Alert: Low Stock',
      body: `${lowStockCount} watch catalog pieces are currently at low stock (<= 2 units).`,
      type: 'LOW_STOCK',
      read: false,
      createdAt: new Date().toISOString(),
      link: '/admin/products',
    });
  }

  for (const b of pendingBookings) {
    systemAlerts.push({
      id: `sys_booking_${b.id}`,
      title: 'Service Booking Pending Assignment',
      body: `Booking #${b.bookingReference} for ${b.watchBrand || 'Horology'} from ${b.customer.name} awaits technician assignment.`,
      type: 'PENDING_BOOKING',
      read: false,
      createdAt: b.createdAt.toISOString(),
      link: `/admin/service-bookings/${b.id}`,
    });
  }

  for (const o of pendingOrders) {
    systemAlerts.push({
      id: `sys_order_${o.id}`,
      title: 'New Timepiece Order Pending',
      body: `Acquisition order #${o.orderReference} for ${formatCurrency(o.totalAmount)} is pending fulfillment.`,
      type: 'PENDING_ORDER',
      read: false,
      createdAt: o.createdAt.toISOString(),
      link: `/admin/orders/${o.id}`,
    });
  }

  const allNotifications = [
    ...systemAlerts,
    ...userNotifications.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      type: n.type,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
      link: undefined,
    })),
  ];

  return <AdminNotificationsClient initialNotifications={allNotifications} />;
}
