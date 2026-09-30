// ============================================================
// Wristloom — Guest & Reference Generator Helper
// Generates collision-resistant, cryptographically strong references
// ============================================================

import crypto from 'crypto';

export function generateOrderReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `WL-ORD-${timestamp}-${randomSuffix}`;
}

export function generateBookingReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `WL-SRV-${timestamp}-${randomSuffix}`;
}
