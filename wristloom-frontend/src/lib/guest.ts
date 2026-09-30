// ============================================================
// Wristloom — Guest & Reference Generator Helper
// Generates collision-resistant, secure random references
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

export function generateGuestEmail(prefix = 'guest'): string {
  const timestamp = Date.now().toString(36);
  const randomSuffix = crypto.randomBytes(4).toString('hex');
  return `${prefix}-${timestamp}-${randomSuffix}@guest.wristloom.luxury`;
}

export function isGuestEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return (
    normalized === 'guest@wristloom.luxury' ||
    normalized.endsWith('@guest.wristloom.luxury') ||
    normalized.includes('@guest.wristloom')
  );
}

