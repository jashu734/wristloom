// ============================================================
// Wristloom Frontend — API Client
// All calls go to the backend at NEXT_PUBLIC_API_URL
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

// ─── Token helpers (client-side only) ─────────────────────────
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('wristloom_token');
}

export function setToken(token: string): void {
  localStorage.setItem('wristloom_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('wristloom_token');
}

// ─── Base fetch ───────────────────────────────────────────────
async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    apiFetch<{ token: string; user: Record<string, unknown> }>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: Record<string, unknown> }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  me: () => apiFetch<{ user: Record<string, unknown> }>('/api/auth/me'),
};

// ─── Bookings ─────────────────────────────────────────────────
export const bookingsApi = {
  getAvailability: (date: string) =>
    apiFetch<{ slots: Array<{ start: string; end: string; label: string; available: boolean; remaining: number }> }>(`/api/bookings/availability?date=${date}`),

  list: () => apiFetch<unknown[]>('/api/bookings'),

  create: (data: Record<string, unknown>) =>
    apiFetch<{ id: string }>('/api/bookings', { method: 'POST', body: JSON.stringify(data) }),

  get: (id: string) => apiFetch<Record<string, unknown>>(`/api/bookings/${id}`),

  cancel: (id: string) =>
    apiFetch<Record<string, unknown>>(`/api/bookings/${id}/cancel`, { method: 'PATCH' }),
};

// ─── Vault ────────────────────────────────────────────────────
export const vaultApi = {
  list: () => apiFetch<unknown[]>('/api/vault'),
  create: (data: Record<string, unknown>) =>
    apiFetch<{ id: string }>('/api/vault', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    apiFetch<Record<string, unknown>>(`/api/vault/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/vault/${id}`, { method: 'DELETE' }),
};

// ─── Notifications ────────────────────────────────────────────
export const notificationsApi = {
  list: () => apiFetch<unknown[]>('/api/notifications'),
  markRead: (id: string) =>
    apiFetch<Record<string, unknown>>(`/api/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () =>
    apiFetch<{ success: boolean }>('/api/notifications/mark-all-read', { method: 'PATCH' }),
};

// ─── Addresses ────────────────────────────────────────────────
export const addressesApi = {
  list: () => apiFetch<unknown[]>('/api/addresses'),
  create: (data: Record<string, unknown>) =>
    apiFetch<{ id: string }>('/api/addresses', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/addresses/${id}`, { method: 'DELETE' }),
};

// ─── Technicians ──────────────────────────────────────────────
export const techniciansApi = {
  list: () => apiFetch<unknown[]>('/api/technicians'),
  get: (id: string) => apiFetch<Record<string, unknown>>(`/api/technicians/${id}`),
  updateLocation: (lat: number, lng: number, bookingId?: string) =>
    apiFetch<{ success: boolean }>('/api/technicians/location', { method: 'POST', body: JSON.stringify({ lat, lng, bookingId }) }),
  setAvailability: (isAvailable: boolean) =>
    apiFetch<Record<string, unknown>>('/api/technicians/availability', { method: 'PATCH', body: JSON.stringify({ isAvailable }) }),
};
