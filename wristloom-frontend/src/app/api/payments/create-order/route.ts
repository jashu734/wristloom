// ============================================================
// Wristloom — Payment Create Order API Route (Next.js)
// Authoritative server-side price calculation, user verification,
// and strict Razorpay order creation (zero fake order fallbacks)
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const { bookingId, orderId } = body;

    if (!bookingId && !orderId) {
      return NextResponse.json({ error: 'bookingId or orderId is required' }, { status: 400 });
    }

    const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      console.error('[Razorpay Config Error] Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET');
      return NextResponse.json(
        { error: 'Razorpay gateway keys are not configured on the server.' },
        { status: 500 }
      );
    }

    let authoritativeAmount: number = 0;
    let customerEmail = session?.user?.email ?? '';
    let customerName = session?.user?.name ?? '';
    let receiptStr = '';

    if (orderId) {
      const order = await db.order.findFirst({
        where: {
          OR: [{ id: orderId }, { orderReference: orderId }],
        },
        include: { user: true },
      });

      if (!order) {
        return NextResponse.json({ error: 'Order not found in Atelier Registry' }, { status: 404 });
      }

      // Authorization: if order belongs to a user, enforce identity match
      if (order.userId && session?.user?.id && order.userId !== session.user.id && session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized to initiate payment for this order' }, { status: 403 });
      }

      authoritativeAmount = order.totalAmount;
      customerEmail = customerEmail || order.shippingEmail;
      customerName = customerName || order.shippingName;
      receiptStr = `ord_${order.orderReference.replace(/[^a-zA-Z0-9]/g, '').slice(-20)}`;
    } else if (bookingId) {
      const booking = await db.repairBooking.findFirst({
        where: {
          OR: [{ id: bookingId }, { bookingReference: bookingId }],
        },
        include: { customer: true },
      });

      if (!booking) {
        return NextResponse.json({ error: 'Service booking not found' }, { status: 404 });
      }

      if (booking.customerId && session?.user?.id && booking.customerId !== session.user.id && session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized to initiate payment for this booking' }, { status: 403 });
      }

      authoritativeAmount = booking.depositAmount ?? booking.estimatedPrice ?? 0;
      customerEmail = customerEmail || booking.customer?.email || '';
      customerName = customerName || booking.customer?.name || '';
      receiptStr = `bk_${booking.bookingReference.replace(/[^a-zA-Z0-9]/g, '').slice(-20)}`;
    }

    if (authoritativeAmount <= 0) {
      return NextResponse.json({ error: 'Invalid order amount for payment creation' }, { status: 400 });
    }

    const amountInPaise = Math.round(authoritativeAmount * 100);

    // Razorpay Test Mode enforces a strict 50,000,000 paise (₹5,00,000 INR) ceiling per transaction
    const isTestMode = key_id.startsWith('rzp_test_');
    if (isTestMode && amountInPaise > 50000000) {
      return NextResponse.json(
        {
          error: `Order amount (₹${authoritativeAmount.toLocaleString('en-IN')}) exceeds the Razorpay Test Mode limit of ₹5,00,000 per transaction. For acquisitions above ₹5,00,000, please select White-Glove Concierge Handover or test with an atelier timepiece under ₹5,00,000.`,
          maxAllowed: 500000,
        },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({ key_id, key_secret });
    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptStr,
      notes: {
        orderId: orderId || '',
        bookingId: bookingId || '',
        customerEmail,
        customerName,
      },
    });

    if (bookingId) {
      await db.repairBooking.updateMany({
        where: { OR: [{ id: bookingId }, { bookingReference: bookingId }] },
        data: { razorpayOrderId: rzpOrder.id },
      }).catch((e) => console.warn('Could not update booking with orderId:', e));
    }

    return NextResponse.json({
      orderId: rzpOrder.id,
      keyId: key_id,
      amount: amountInPaise,
      currency: 'INR',
    });
  } catch (err: any) {
    console.error('[Create Order Error]', err);
    const desc = err?.error?.description || err.message || 'Failed to initialize payment gateway order';
    return NextResponse.json({ error: desc }, { status: 400 });
  }
}
