// ============================================================
// Wristloom — Admin Notifications API Route
// Aggregates real system alerts: new orders, pending bookings, low stock
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { formatCurrency } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const [userNotifications, pendingBookings, pendingOrders, lowStockCount] = await Promise.all([
      db.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
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

    // Synthesize system notifications
    const systemAlerts = [];

    if (lowStockCount > 0) {
      systemAlerts.push({
        id: 'sys_low_stock',
        title: 'Inventory Alert',
        body: `${lowStockCount} watch catalog pieces are currently at low stock (<= 2 units).`,
        type: 'LOW_STOCK',
        read: false,
        createdAt: new Date(),
        link: '/admin/products',
      });
    }

    for (const b of pendingBookings) {
      systemAlerts.push({
        id: `sys_booking_${b.id}`,
        title: 'New Service Booking Pending',
        body: `Booking #${b.bookingReference} for ${b.watchBrand || 'Horology'} from ${b.customer.name} awaits technician assignment.`,
        type: 'PENDING_BOOKING',
        read: false,
        createdAt: b.createdAt,
        link: `/admin/service-bookings/${b.id}`,
      });
    }

    for (const o of pendingOrders) {
      systemAlerts.push({
        id: `sys_order_${o.id}`,
        title: 'New Watch Order Pending',
        body: `Acquisition order #${o.orderReference} for ${formatCurrency(o.totalAmount)} is pending processing.`,
        type: 'PENDING_ORDER',
        read: false,
        createdAt: o.createdAt,
        link: `/admin/orders/${o.id}`,
      });
    }

    const allNotifications = [...systemAlerts, ...userNotifications];

    return NextResponse.json({
      notifications: allNotifications,
      unreadCount: allNotifications.filter((n) => !n.read).length,
    });
  } catch (error: any) {
    console.error('[Admin Notifications GET Error]', error);
    return NextResponse.json({ error: error.message ?? 'Failed to load notifications' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      await db.notification.updateMany({
        where: { userId: session.user.id },
        data: { read: true },
      });
      return NextResponse.json({ success: true });
    }

    if (notificationId && !notificationId.startsWith('sys_')) {
      await db.notification.update({
        where: { id: notificationId },
        data: { read: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Admin Notifications PATCH Error]', error);
    return NextResponse.json({ error: error.message ?? 'Failed to update notification' }, { status: 500 });
  }
}
