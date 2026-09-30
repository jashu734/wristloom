-- ============================================================
-- Wristloom — Supabase Row Level Security (RLS) Policies
-- Comprehensive, hardened RLS policies with quoted identifiers
-- ============================================================

-- 1. Enable RLS on all platform & NextAuth tables
ALTER TABLE IF EXISTS "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "addresses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "technicians" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "repair_bookings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "technician_locations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "watch_vault_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "service_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "credit_wallets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "credit_transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "authentication_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "trade_in_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "VerificationToken" ENABLE ROW LEVEL SECURITY;

-- 2. Drop legacy or insecure policies
DROP POLICY IF EXISTS "Public read verified technicians" ON "technicians";
DROP POLICY IF EXISTS "Public read verified reviews" ON "reviews";
DROP POLICY IF EXISTS "Realtime read technician locations" ON "technician_locations";
DROP POLICY IF EXISTS "Public read products" ON "products";

-- 3. Public Catalog Read Policies
-- Timepiece catalog products are viewable by all
CREATE POLICY "Public read products"
  ON "products" FOR SELECT
  TO authenticated, anon
  USING (true);

-- Public view of verified technician roster (excluding sensitive columns via view/API)
CREATE POLICY "Public read verified technicians"
  ON "technicians" FOR SELECT
  TO authenticated, anon
  USING ("isVerified" = true);

-- Public view of authentic verified reviews
CREATE POLICY "Public read verified reviews"
  ON "reviews" FOR SELECT
  TO authenticated, anon
  USING ("verified" = true);

-- 4. Protected Location Telemetry
-- Only authenticated users or participants in an active booking can read technician telemetry
CREATE POLICY "Protected read technician locations"
  ON "technician_locations" FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "repair_bookings" rb
      WHERE rb."id" = "technician_locations"."bookingId"
        AND (
          rb."customerId" = auth.uid()::text
          OR EXISTS (
            SELECT 1 FROM "technicians" t
            WHERE t."id" = rb."technicianId" AND t."userId" = auth.uid()::text
          )
        )
    )
  );

-- 5. User Privacy & Ownership Policies
CREATE POLICY "Users read own profile"
  ON "users" FOR SELECT
  TO authenticated
  USING ("id" = auth.uid()::text);

CREATE POLICY "Users read own addresses"
  ON "addresses" FOR SELECT
  TO authenticated
  USING ("userId" = auth.uid()::text);

CREATE POLICY "Customers read own bookings"
  ON "repair_bookings" FOR SELECT
  TO authenticated
  USING ("customerId" = auth.uid()::text);

CREATE POLICY "Owners read own vault items"
  ON "watch_vault_items" FOR SELECT
  TO authenticated
  USING ("ownerId" = auth.uid()::text);

CREATE POLICY "Users read own notifications"
  ON "notifications" FOR SELECT
  TO authenticated
  USING ("userId" = auth.uid()::text);

CREATE POLICY "Users read own credit wallet"
  ON "credit_wallets" FOR SELECT
  TO authenticated
  USING ("customerId" = auth.uid()::text);

CREATE POLICY "Users read own orders"
  ON "orders" FOR SELECT
  TO authenticated
  USING ("user_id" = auth.uid()::text);

-- 6. Sensitive OAuth & Token Tables
-- Locked down exclusively to the owner; service role automatically bypasses RLS
CREATE POLICY "Users access own account tokens"
  ON "Account" FOR ALL
  TO authenticated
  USING ("userId" = auth.uid()::text);

CREATE POLICY "Users access own sessions"
  ON "Session" FOR ALL
  TO authenticated
  USING ("userId" = auth.uid()::text);

-- 7. Realtime Publications
-- Only enable Realtime on appropriate broadcast channels
ALTER PUBLICATION supabase_realtime ADD TABLE "technician_locations";
ALTER PUBLICATION supabase_realtime ADD TABLE "repair_bookings";
ALTER PUBLICATION supabase_realtime ADD TABLE "notifications";
