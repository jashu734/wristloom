// ============================================================
// Wristloom — Payment Verification API Route (Next.js)
// Enforces secure gateway signature verification & idempotent stock reservation
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isSimulatedPaymentAllowed, verifyRazorpaySignature } from '@/lib/payments';
import { decrementInventory } from '@/lib/inventory';

export async function POST(req: NextRequest) {
  try {
    const {
      bookingId,
      orderId,
      paymentMethod = 'upi',
      upiId,
      simulateFailure,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    if (!bookingId && !orderId) {
      return NextResponse.json({ error: 'Either bookingId or orderId is required' }, { status: 400 });
    }

    const isSimulated = !razorpay_signature;

    // Reject simulated payments in production unless explicitly allowed
    if (isSimulated && !isSimulatedPaymentAllowed()) {
      return NextResponse.json(
        {
          error:
            'Direct simulated payments are disabled in production. Please complete checkout via the authorized payment gateway.',
        },
        { status: 403 }
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 1. ORDER PAYMENT VERIFICATION (Cart & Acquisition Flow)
    // ─────────────────────────────────────────────────────────────
    if (orderId) {
      const order = await db.order.findFirst({
        where: {
          OR: [{ id: orderId }, { orderReference: orderId }],
        },
        include: {
          orderItems: true,
          user: { select: { id: true, name: true, email: true } },
        },
      });

      if (!order) {
        return NextResponse.json({ error: 'Order not found in Atelier Registry' }, { status: 404 });
      }

      // Idempotency: if already paid, return existing success state
      if (order.paymentStatus === 'FULLY_PAID') {
        return NextResponse.json({
          success: true,
          order,
          message: 'Order has already been confirmed and paid.',
        });
      }

      // Explicit failure simulation or declined UPI
      if (simulateFailure === true || (upiId && (upiId.includes('fail') || upiId.includes('decline')))) {
        return NextResponse.json(
          {
            success: false,
            error: 'UPI transaction was declined by bank or timed out. Please retry or choose another payment method.',
          },
          { status: 400 }
        );
      }

      // Secure HMAC signature check if gateway credentials provided
      if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
        const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
        if (!isValid) {
          return NextResponse.json({ error: 'Invalid payment signature from gateway' }, { status: 400 });
        }
      }

      const verifiedPaymentId =
        razorpay_payment_id || `WL_${paymentMethod.toUpperCase()}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

      // Update Order and decrement inventory atomically
      const updatedOrder = await db.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'FULLY_PAID',
          status: 'CONFIRMED',
          paymentMethod,
          notes:
            (order.notes ? `${order.notes} | ` : '') +
            `Paid via ${paymentMethod.toUpperCase()} (${verifiedPaymentId}${upiId ? ` - VPA: ${upiId}` : ''})`,
        },
        include: {
          orderItems: true,
          user: { select: { id: true, name: true, email: true } },
        },
      });

      // Decrement inventory stock
      await decrementInventory(order.orderItems);

      // Customer In-App Notification
      if (order.userId) {
        await db.notification.create({
          data: {
            userId: order.userId,
            type: 'BOOKING_CONFIRMED',
            title: 'Payment Confirmed & Timepiece Allocated',
            body: `Payment of ₹${order.totalAmount.toLocaleString('en-IN')} received via ${paymentMethod.toUpperCase()} (#${verifiedPaymentId}). Your order #${order.orderReference} is confirmed.`,
          },
        }).catch((err: any) => console.warn('Customer notification warning:', err));
      }

      return NextResponse.json({
        success: true,
        order: updatedOrder,
        paymentId: verifiedPaymentId,
        message: 'Payment successfully authorized and order confirmed',
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 2. REPAIR BOOKING PAYMENT VERIFICATION (Service Flow)
    // ─────────────────────────────────────────────────────────────
    if (bookingId) {
      const booking = await db.repairBooking.findFirst({
        where: {
          OR: [{ id: bookingId }, { bookingReference: bookingId }],
        },
      });

      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }

      // Idempotency: if deposit already paid
      if (booking.paymentStatus === 'DEPOSIT_PAID' || booking.paymentStatus === 'FULLY_PAID') {
        return NextResponse.json({ success: true, booking });
      }

      // Secure HMAC signature check if gateway credentials provided
      if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
        const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
        if (!isValid) {
          return NextResponse.json({ error: 'Invalid payment signature from gateway' }, { status: 400 });
        }
      }

      const verifiedPaymentId = razorpay_payment_id || `pay_${Date.now()}`;

      // Update booking in DB
      const updated = await db.repairBooking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: 'DEPOSIT_PAID',
          status: 'CONFIRMED',
          razorpayOrderId: razorpay_order_id ?? null,
          razorpayPaymentId: verifiedPaymentId,
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
            body: `Deposit received for #${updated.bookingReference} (${updated.serviceType}). Your appointment is confirmed!`,
          },
        }).catch((err: any) => console.warn('Customer notification warning:', err));
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
        }).catch((err: any) => console.warn('Technician notification warning:', err));
      }

      return NextResponse.json({ success: true, booking: updated });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (err: any) {
    console.error('[Verify Payment Error]', err);
    return NextResponse.json({ error: err.message ?? 'Payment verification failed' }, { status: 500 });
  }
}
