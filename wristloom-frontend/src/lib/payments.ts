// ============================================================
// Wristloom — Payments Verification & Security Helper
// Validates secure HMAC SHA-256 signatures from payment gateway
// ============================================================

import crypto from 'crypto';

export function isSimulatedPaymentAllowed(): boolean {
  if (process.env.NODE_ENV !== 'production') return true;
  return process.env.ALLOW_SIMULATED_PAYMENTS === 'true' || process.env.NEXT_PUBLIC_ALLOW_SIMULATED_PAYMENTS === 'true';
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

export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string,
  secret?: string
): boolean {
  const webhookSecret = secret || process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
  if (!webhookSecret) {
    console.error('[Payment Error] Neither RAZORPAY_WEBHOOK_SECRET nor RAZORPAY_KEY_SECRET is configured.');
    return false;
  }

  const generated = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(generated), Buffer.from(signature));
  } catch {
    return false;
  }
}

