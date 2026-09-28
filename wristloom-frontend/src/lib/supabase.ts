// ============================================================
// Wristloom — Supabase Clients
// Browser client (anon key) + Server client (service role)
// ============================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ─── Browser / Client-side Supabase ──────────────────────────
// Used for Realtime subscriptions and client-side uploads
export function createBrowserClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Singleton for client components
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowser() {
  if (!browserClient) {
    browserClient = createBrowserClient();
  }
  return browserClient;
}

// ─── Server-side Supabase ─────────────────────────────────────
// Used in API routes for privileged operations (bypasses RLS)
export function createServerClient() {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// ─── Storage Helpers ──────────────────────────────────────────

export const STORAGE_BUCKETS = {
  WATCH_IMAGES: 'watch-images',
  REPAIR_PHOTOS: 'repair-photos',
  DOCUMENTS: 'documents',
  AVATARS: 'avatars',
} as const;

export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  const supabase = createServerClient();
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    cacheControl: '3600',
  });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
}

// ─── Realtime Channel Names ────────────────────────────────────

export const realtimeChannels = {
  bookingLocation: (bookingId: string) => `booking:${bookingId}:location`,
  bookingStatus: (bookingId: string) => `booking:${bookingId}:status`,
  technicianNotifications: (technicianId: string) => `technician:${technicianId}:notifications`,
  customerNotifications: (userId: string) => `user:${userId}:notifications`,
} as const;
