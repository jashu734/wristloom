// ============================================================
// Wristloom — Payment Create Order API Route (Next.js)
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { bookingId, amount } = await req.json();

    if (!bookingId || !amount) {
      return NextResponse.json({ error: 'bookingId and amount are required' }, { status: 400 });
    }

    const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    // In INR paise (amount * 100)
    const amountInPaise = Math.round(amount * 100);

    let orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    let keyId = key_id ?? 'rzp_test_wristloom';

    if (key_id && key_secret && !key_id.includes('placeholder')) {
      try {
        const razorpay = new Razorpay({ key_id, key_secret });
        const rzpOrder = await razorpay.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${bookingId.slice(-8)}`,
          notes: { bookingId },
        });
        orderId = rzpOrder.id;
        keyId = key_id;
      } catch (rzpErr) {
        console.warn('[Razorpay API Warning] Falling back to test order:', rzpErr);
      }
    }

    // Update booking with razorpayOrderId
    await db.repairBooking.update({
      where: { id: bookingId },
      data: { razorpayOrderId: orderId },
    }).catch((e) => console.warn('Could not update booking with orderId:', e));

    return NextResponse.json({
      orderId,
      keyId,
      amount: amountInPaise,
      currency: 'INR',
    });
  } catch (err: any) {
    console.error('[Create Order Error]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to initialize payment order' }, { status: 500 });
  }
}
