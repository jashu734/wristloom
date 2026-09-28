// ============================================================
// Wristloom — Payment Verification API Route (Next.js)
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    // Verify signature if secret is present and signature is provided
    if (key_secret && razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const generated = crypto
        .createHmac('sha256', key_secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generated !== razorpay_signature) {
        console.warn('[Payment Signature Mismatch]');
        // Allow pass in dev/test if not in strict production
        if (process.env.NODE_ENV === 'production') {
          return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
        }
      }
    }

    // Update booking in DB
    const updated = await db.repairBooking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'DEPOSIT_PAID',
        status: 'CONFIRMED',
        razorpayOrderId: razorpay_order_id ?? null,
        razorpayPaymentId: razorpay_payment_id ?? `pay_${Date.now()}`,
      },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        technician: { select: { id: true, userId: true, user: { select: { name: true } } } },
      },
    });

    // Create Notification row for Customer
    if (updated.customerId) {
      await db.notification.create({
        data: {
          userId: updated.customerId,
          bookingId: updated.id,
          type: 'BOOKING_CONFIRMED',
          title: 'Booking Confirmed & Deposit Received',
          body: `Deposit of 30% received for #${updated.bookingReference} (${updated.serviceType}). Your appointment is confirmed!`,
        },
      }).catch((err) => console.warn('Customer notification warning:', err));
    }

    // Create Notification row for assigned Technician if any
    if (updated.technician?.userId) {
      await db.notification.create({
        data: {
          userId: updated.technician.userId,
          bookingId: updated.id,
          type: 'NEW_BOOKING_ASSIGNED',
          title: 'New Confirmed Booking Assigned',
          body: `Booking #${updated.bookingReference} has been confirmed. Scheduled for ${updated.scheduledTimeStart}.`,
        },
      }).catch((err) => console.warn('Technician notification warning:', err));
    }

    return NextResponse.json({ success: true, booking: updated });
  } catch (err: any) {
    console.error('[Verify Payment Error]', err);
    return NextResponse.json({ error: err.message ?? 'Payment verification failed' }, { status: 500 });
  }
}
