// ============================================================
// Wristloom — Roles & Permissions Helper
// Configurable Admin emails & Role verification
// ============================================================

export type UserRole = 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN';

export function getAdminEmails(): string[] {
  const configured = process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
    : [];

  const defaultAdmin = 'wristloom@gmail.com';
  if (!configured.includes(defaultAdmin)) {
    configured.push(defaultAdmin);
  }

  return configured;
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}

export function isUserAdmin(user?: { role?: string; email?: string | null } | null): boolean {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  return isAdminEmail(user.email);
}

export function isUserTechnician(user?: { role?: string } | null): boolean {
  return user?.role === 'TECHNICIAN';
}

export function isUserCustomer(user?: { role?: string } | null): boolean {
  return user?.role === 'CUSTOMER';
}
