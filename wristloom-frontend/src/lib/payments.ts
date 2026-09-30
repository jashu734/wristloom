// ============================================================
// Wristloom — Payments Verification & Security Helper
// Validates cryptographic HMAC signatures from payment gateway
// ============================================================

import crypto from 'crypto';

export function isSimulatedPaymentAllowed(): boolean {
  if (process.env.NODE_ENV !== 'production') return true;
  return process.env.ALLOW_SIMULATED_PAYMENTS === 'true';
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    console.error('[Payment Error] RAZORPAY_KEY_SECRET is not configured.');
    return false;
  }

  const generated = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  // Constant-time string comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(generated), Buffer.from(signature));
  } catch {
    return false;
  }
}
