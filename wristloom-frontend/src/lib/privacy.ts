// ============================================================
// Wristloom — Privacy & Sensitive Data Masking Helper
// Protects PII across anonymous & guest endpoints
// ============================================================

export function maskEmail(email?: string | null): string {
  if (!email) return '';
  const parts = email.trim().split('@');
  if (parts.length !== 2) return '***@***.***';

  const [username, domain] = parts;
  if (username.length <= 2) {
    return `${username[0]}***@${domain}`;
  }
  return `${username[0]}***${username[username.length - 1]}@${domain}`;
}

export function maskPhone(phone?: string | null): string {
  if (!phone) return '';
  const cleaned = phone.trim();
  if (cleaned.length <= 4) return '****';
  const lastFour = cleaned.slice(-4);
  return `${'*'.repeat(Math.max(0, cleaned.length - 4))}${lastFour}`;
}

export interface MaskableAddress {
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  formattedAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export function maskAddress<T extends MaskableAddress>(addr?: T | null): T | null {
  if (!addr) return null;

  return {
    ...addr,
    addressLine1: '•••••••• Confidential Atelier Street',
    addressLine2: null,
    formattedAddress: [addr.city, addr.state, addr.country].filter(Boolean).join(', '),
    // Approximate coordinates to protect exact residential location (within ~1.5km)
    latitude: typeof addr.latitude === 'number' ? Math.round(addr.latitude * 50) / 50 : undefined,
    longitude: typeof addr.longitude === 'number' ? Math.round(addr.longitude * 50) / 50 : undefined,
  } as T;
}
