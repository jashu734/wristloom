// ============================================================
// Wristloom — Single Order API Route
// GET: Order details
// PATCH: Admin status update (CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    const { id } = await context.params;

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
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (session?.user) {
      const isOwner = order.userId === session.user.id;
      const isAdmin = session.user.role === 'ADMIN';
      if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error('[Order GET Error]', error);
    return NextResponse.json({ error: error.message ?? 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { status, paymentStatus } = body;

    const existing = await db.order.findFirst({
      where: {
        OR: [{ id }, { orderReference: id }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const data: any = {};
    if (status) data.status = status;
    if (paymentStatus) data.paymentStatus = paymentStatus;

    const updated = await db.order.update({
      where: { id: existing.id },
      data,
      include: { orderItems: true },
    });

    // Notify user of shipment/delivery update
    if (existing.userId && status) {
      await db.notification.create({
        data: {
          userId: existing.userId,
          type: 'BOOKING_CONFIRMED',
          title: `Order Status: ${status}`,
          body: `Your acquisition #${existing.orderReference} status is now ${status}.`,
        },
      }).catch((e) => console.warn('Order status notif warning:', e));
    }

    return NextResponse.json({ order: updated });
  } catch (error: any) {
    console.error('[Order PATCH Error]', error);
    return NextResponse.json({ error: error.message ?? 'Failed to update order' }, { status: 500 });
  }
}
