// ============================================================
// Wristloom — Centralized Authorization & Permission Engine
// Layer 4: Auth & Permissions (15-Layer SaaS Playbook, p. 10)
// Single central function `can(user, action, resource)`
// ============================================================

import { UserRole } from '@/lib/roles';

export type Action =
  // Orders
  | 'order:create'
  | 'order:read'
  | 'order:update'
  | 'order:cancel'
  | 'order:list_all'
  // Bookings
  | 'booking:create'
  | 'booking:read'
  | 'booking:update_status'
  | 'booking:cancel'
  | 'booking:assign_technician'
  | 'booking:reprice'
  | 'booking:list_all'
  // Vault
  | 'vault:create'
  | 'vault:read'
  | 'vault:update'
  | 'vault:delete'
  // Catalog & Inventory
  | 'product:create'
  | 'product:update'
  | 'product:delete'
  // Technicians
  | 'technician:create'
  | 'technician:update_location'
  | 'technician:view_private_info'
  | 'technician:list_all'
  // Admin & Analytics
  | 'admin:access_dashboard'
  | 'admin:view_analytics'
  | 'admin:manage_users';

export interface AuthUser {
  id: string;
  role: UserRole;
  email?: string | null;
}

export interface ResourceContext {
  ownerId?: string | null;
  customerId?: string | null;
  technicianUserId?: string | null;
  status?: string | null;
}

/**
 * Single authoritative permission evaluator.
 * Always enforced on the server-side.
 */
export function can(
  user: AuthUser | null | undefined,
  action: Action,
  resource?: ResourceContext
): boolean {
  if (!user) {
    // Unauthenticated visitors have limited read permissions (handled by public route rules)
    return false;
  }

  // System Administrators have universal access
  if (user.role === 'ADMIN') {
    return true;
  }

  switch (action) {
    // ── Orders ───────────────────────────────────────────────
    case 'order:create':
      return true; // Any registered user can create an order

    case 'order:read':
      if (!resource) return true;
      return resource.ownerId === user.id || resource.customerId === user.id;

    case 'order:cancel':
      if (!resource) return false;
      return (resource.ownerId === user.id || resource.customerId === user.id) && resource.status === 'PENDING';

    case 'order:list_all':
      return false; // Only admin

    // ── Bookings ─────────────────────────────────────────────
    case 'booking:create':
      return user.role === 'CUSTOMER';

    case 'booking:read':
      if (!resource) return true;
      return (
        resource.customerId === user.id ||
        (user.role === 'TECHNICIAN' && resource.technicianUserId === user.id)
      );

    case 'booking:cancel':
      if (!resource) return false;
      return resource.customerId === user.id && resource.status === 'PENDING';

    case 'booking:update_status':
      if (!resource) return false;
      // Technicians can progress assigned jobs
      if (user.role === 'TECHNICIAN') {
        return resource.technicianUserId === user.id;
      }
      return false;

    case 'booking:assign_technician':
    case 'booking:reprice':
    case 'booking:list_all':
      return false; // Admin only

    // ── Watch Vault ──────────────────────────────────────────
    case 'vault:create':
    case 'vault:read':
    case 'vault:update':
    case 'vault:delete':
      if (!resource) return true;
      return resource.ownerId === user.id;

    // ── Catalog & Products ───────────────────────────────────
    case 'product:create':
    case 'product:update':
    case 'product:delete':
      return false; // Admin only

    // ── Technicians ──────────────────────────────────────────
    case 'technician:create':
    case 'technician:view_private_info':
    case 'technician:list_all':
      return false; // Admin only

    case 'technician:update_location':
      return user.role === 'TECHNICIAN';

    // ── Admin Tools ──────────────────────────────────────────
    case 'admin:access_dashboard':
    case 'admin:view_analytics':
    case 'admin:manage_users':
      return false; // Admin only

    default:
      return false;
  }
}
