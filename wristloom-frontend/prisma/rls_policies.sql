-- ============================================================
-- Wristloom — Supabase Row Level Security (RLS) Policies
-- Run this script in your Supabase SQL Editor
-- ============================================================

-- 1. Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE technician_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_vault_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- 2. Service Role Bypass
-- Next.js API server connects with connection pooler / service key and automatically bypasses RLS.

-- 3. Public / Anon Read Policies (for client components & live tracking)
-- Allow anyone to view verified technician roster & public profile
CREATE POLICY "Public read verified technicians"
  ON technicians FOR SELECT
  USING (isVerified = true);

-- Allow public read of verified reviews
CREATE POLICY "Public read verified reviews"
  ON reviews FOR SELECT
  USING (verified = true);

-- Allow Supabase Realtime broadcast read for technician locations (client radar)
CREATE POLICY "Realtime read technician locations"
  ON technician_locations FOR SELECT
  TO authenticated, anon
  USING (true);

-- 4. Enable Realtime Publications
-- Enables Supabase Realtime on location telemetry and bookings
ALTER PUBLICATION supabase_realtime ADD TABLE technician_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE repair_bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
