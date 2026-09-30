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

    if (order.userId) {
      if (!session?.user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      const isOwner = order.userId === session.user.id;
      const isAdmin = session.user.role === 'ADMIN';
      if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Parse tracking info from notes if structured
    let trackingInfo: any = null;
    try {
      if (order.notes && (order.notes.startsWith('{') || order.notes.includes('"trackingNumber"'))) {
        trackingInfo = JSON.parse(order.notes);
      }
    } catch {
      // not JSON notes
    }

    return NextResponse.json({
      order: {
        ...order,
        trackingInfo,
      },
    });
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
    const {
      status,
      paymentStatus,
      trackingNumber,
      carrier,
      estimatedDelivery,
      dispatchNotes,
      subStatus,
    } = body;

    const existing = await db.order.findFirst({
      where: {
        OR: [{ id }, { orderReference: id }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Parse existing structured notes or initialize
    let currentTrackingData: any = {};
    try {
      if (existing.notes && (existing.notes.startsWith('{') || existing.notes.includes('"trackingNumber"'))) {
        currentTrackingData = JSON.parse(existing.notes);
      } else if (existing.notes) {
        currentTrackingData.legacyNotes = existing.notes;
      }
    } catch {
      currentTrackingData.legacyNotes = existing.notes;
    }

    if (trackingNumber !== undefined) currentTrackingData.trackingNumber = trackingNumber;
    if (carrier !== undefined) currentTrackingData.carrier = carrier;
    if (estimatedDelivery !== undefined) currentTrackingData.estimatedDelivery = estimatedDelivery;
    if (dispatchNotes !== undefined) currentTrackingData.dispatchNotes = dispatchNotes;
    if (subStatus !== undefined) currentTrackingData.subStatus = subStatus;

    // Maintain timeline history events
    if (!Array.isArray(currentTrackingData.events)) {
      currentTrackingData.events = [
        {
          status: 'PENDING',
          title: 'Order Placed',
          timestamp: existing.createdAt.toISOString(),
          note: 'Acquisition order initiated through concierge.',
        },
      ];
    }

    const effectiveStatus = status || existing.status;
    if (status && status !== existing.status) {
      const stageTitles: Record<string, string> = {
        CONFIRMED: 'Order Confirmed',
        PROCESSING: 'Processing & Vault Retrieval',
        SHIPPED: 'Dispatched with Armored Courier',
        DELIVERED: 'Delivered & Handed Over',
        CANCELLED: 'Order Cancelled',
      };

      currentTrackingData.events.push({
        status,
        title: stageTitles[status] || status,
        timestamp: new Date().toISOString(),
        note: dispatchNotes || `Status updated to ${status} by atelier administration.`,
        updatedBy: session.user.name || 'Wristloom Atelier',
      });
    }

    const data: any = {
      notes: JSON.stringify(currentTrackingData),
    };

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
          body: `Your acquisition #${existing.orderReference} status is now ${status}. ${
            trackingNumber ? `Tracking number: ${trackingNumber}` : ''
          }`,
        },
      }).catch((e) => console.warn('Order status notif warning:', e));
    }

    return NextResponse.json({
      order: {
        ...updated,
        trackingInfo: currentTrackingData,
      },
    });
  } catch (error: any) {
    console.error('[Order PATCH Error]', error);
    return NextResponse.json({ error: error.message ?? 'Failed to update order' }, { status: 500 });
  }
}
