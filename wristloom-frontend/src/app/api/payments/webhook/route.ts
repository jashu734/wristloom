// ============================================================
// Wristloom — Razorpay Webhooks API Route
// Layer 5: APIs & Backend Logic (15-Layer SaaS Playbook, p. 13)
// Idempotent webhook event processor with HMAC signature verification
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyRazorpayWebhookSignature } from '@/lib/payments';
import { decrementInventory } from '@/lib/inventory';

// In-memory cache of recently processed event IDs (complemented by DB status check)
const processedEventIds = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-razorpay-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing x-razorpay-signature header' }, { status: 400 });
    }

    const rawBody = await req.text();

    const isValid = verifyRazorpayWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.error('[Webhook] Invalid Razorpay webhook signature');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const eventId = payload.event_id || payload.id || `${payload.event}_${payload.created_at}`;

    // 1. Idempotency Guard: prevent duplicate execution if event already processed
    if (processedEventIds.has(eventId)) {
      return NextResponse.json({ success: true, message: 'Event already processed' });
    }

    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;

    // Resolve notes and identifiers from payload
    const notes = paymentEntity?.notes || orderEntity?.notes || {};
    const orderReference = notes.orderReference;
    const bookingReference = notes.bookingReference;
    const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
    const razorpayPaymentId = paymentEntity?.id;

    console.info(`[Webhook] Processing event: ${event} for orderRef=${orderReference}, bookingRef=${bookingReference}`);

    // 2. Handle Payment Success (Captured / Authorized)
    if (event === 'payment.captured' || event === 'order.paid') {
      // ── Process Order Payment ─────────────────────────────
      if (orderReference || razorpayOrderId) {
        const order = await db.order.findFirst({
          where: {
            OR: [
              ...(orderReference ? [{ orderReference }] : []),
              ...(razorpayOrderId ? [{ id: razorpayOrderId }] : []),
            ],
          },
          include: { orderItems: true },
        });

        if (order) {
          if (order.paymentStatus !== 'FULLY_PAID') {
            await db.order.update({
              where: { id: order.id },
              data: {
                paymentStatus: 'FULLY_PAID',
                status: 'CONFIRMED',
                paymentMethod: 'razorpay',
                notes: (order.notes ? `${order.notes} | ` : '') + `Webhook Verified (${razorpayPaymentId})`,
              },
            });

            // Decrement inventory stock atomically
            await decrementInventory(order.orderItems);

            // Notify user
            if (order.userId) {
              await db.notification.create({
                data: {
                  userId: order.userId,
                  type: 'BOOKING_CONFIRMED',
                  title: 'Payment Received',
                  body: `Your payment of ₹${order.totalAmount.toLocaleString('en-IN')} for order #${order.orderReference} has been verified by the gateway.`,
                },
              }).catch((e) => console.warn('Webhook notification note:', e));
            }
          }
        }
      }

      // ── Process Repair Booking Deposit ────────────────────
      if (bookingReference) {
        const booking = await db.repairBooking.findFirst({
          where: { bookingReference },
        });

        if (booking && booking.paymentStatus === 'UNPAID') {
          await db.repairBooking.update({
            where: { id: booking.id },
            data: {
              paymentStatus: 'DEPOSIT_PAID',
              status: 'CONFIRMED',
              razorpayOrderId: razorpayOrderId ?? null,
              razorpayPaymentId: razorpayPaymentId ?? null,
            },
          });

          if (booking.customerId) {
            await db.notification.create({
              data: {
                userId: booking.customerId,
                bookingId: booking.id,
                type: 'BOOKING_CONFIRMED',
                title: 'Service Deposit Verified',
                body: `Deposit for service #${booking.bookingReference} has been confirmed via gateway webhook.`,
              },
            }).catch((e) => console.warn('Booking webhook notification note:', e));
          }
        }
      }
    }

    // 3. Handle Payment Failed
    else if (event === 'payment.failed') {
      const reason = paymentEntity?.error_description || 'Payment was declined or expired.';
      console.warn(`[Webhook] Payment failed: ${reason}`);

      if (orderReference) {
        const order = await db.order.findFirst({ where: { orderReference } });
        if (order && order.paymentStatus === 'UNPAID') {
          await db.order.update({
            where: { id: order.id },
            data: {
              notes: (order.notes ? `${order.notes} | ` : '') + `Payment attempt failed: ${reason}`,
            },
          }).catch((e) => console.warn('Order note update warning:', e));
        }
      }
    }

    // Mark event ID as processed
    processedEventIds.add(eventId);
    if (processedEventIds.size > 2000) {
      // Clear oldest entries if set grows too large
      const iterator = processedEventIds.values();
      for (let i = 0; i < 500; i++) {
        const val = iterator.next().value;
        if (val) processedEventIds.delete(val);
      }
    }

    return NextResponse.json({ success: true, eventId, event });
  } catch (error: any) {
    console.error('[Webhook Error]', error);
    return NextResponse.json({ error: error.message || 'Webhook processing failure' }, { status: 500 });
  }
}
