// ============================================================
// Wristloom — Order & Service Booking Access Authorization
// Standardizes authorization rules across API & client pages
// ============================================================

import { isUserAdmin } from './roles';

export interface AuthUser {
  id: string;
  role: string;
  email?: string | null;
}

export function canAccessOrder(
  user: AuthUser | null | undefined,
  order: { userId?: string | null; shippingEmail?: string | null }
): { allowed: boolean; isOwner: boolean; isAdmin: boolean; isGuest: boolean } {
  const isAdmin = isUserAdmin(user);
  if (isAdmin) {
    return { allowed: true, isOwner: false, isAdmin: true, isGuest: false };
  }

  const isOwner = Boolean(user?.id && order.userId && user.id === order.userId);
  if (isOwner) {
    return { allowed: true, isOwner: true, isAdmin: false, isGuest: false };
  }

  // If order was placed as a guest (no userId)
  if (!order.userId) {
    // If the authenticated user has matching email to shippingEmail, allow
    if (user?.email && order.shippingEmail && user.email.toLowerCase() === order.shippingEmail.toLowerCase()) {
      return { allowed: true, isOwner: true, isAdmin: false, isGuest: true };
    }
    // Guest accessing by reference directly (needs PII masking)
    return { allowed: true, isOwner: false, isAdmin: false, isGuest: true };
  }

  return { allowed: false, isOwner: false, isAdmin: false, isGuest: false };
}
