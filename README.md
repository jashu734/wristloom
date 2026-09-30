# Wristloom — Haute Horlogerie Digital Atelier & Care Platform

Wristloom is a premier, full-stack digital ecosystem for luxury timepiece acquisition, professional authentication, white-glove house-call maintenance, live technician radar tracking, and personal digital vault management.

---

## 🔒 Critical: Security & Credential Rotation Guide

> [!CAUTION]
> If live environment secrets or cookie files were previously stored in uncommitted sandbox archives or shared channels, treat every one of those credentials as exposed and rotate them immediately across their respective dashboards.

### Mandatory Rotation Checklist

1. **Supabase Database & Service Role**:
   - Reset the PostgreSQL database password in the Supabase Dashboard (`Project Settings -> Database`).
   - Rotate the `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (`Project Settings -> API`).

2. **NextAuth Secret**:
   - Generate a new 32-byte cryptographic secret:

     ```bash
     openssl rand -base64 32
     ```

   - Update `AUTH_SECRET` in `.env.local`.

3. **Google OAuth 2.0 Credentials**:
   - In Google Cloud Console (`APIs & Services -> Credentials`), rotate Client Secret and re-verify allowed redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://yourdomain.com/api/auth/callback/google`

4. **Razorpay Payments**:
   - Regenerate Key Secret in Razorpay Dashboard (`Settings -> API Keys`).
   - Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.

5. **Google Maps API**:
   - Restrict browser key (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`) to your production domain and localhost.
   - Restrict server key (`GOOGLE_MAPS_SERVER_API_KEY`) to IP addresses/Distance Matrix API.

6. **Resend Email**:
   - Revoke and regenerate the `RESEND_API_KEY`.

---

## 🏛️ System Architecture

```text
WristLoom/
├── wristloom-frontend/
│   ├── prisma/
│   │   ├── schema.prisma         ← PostgreSQL Data Models with High-Performance Indexes
│   │   └── rls_policies.sql      ← Hardened Supabase Row Level Security Policies
│   ├── public/                   ← High-resolution static assets & brand collateral
│   ├── src/
│   │   ├── app/                  ← Next.js 16 App Router Pages & REST API Endpoints
│   │   │   ├── api/
│   │   │   │   ├── auth/         ← NextAuth v5, safe register & constant-time verify
│   │   │   │   ├── bookings/     ← Server-priced repair bookings & role-scoped updates
│   │   │   │   ├── orders/       ← Server-validated timepiece purchases & stock checks
│   │   │   │   ├── payments/     ← Cryptographic Razorpay HMAC verification & stock decrement
│   │   │   │   ├── technicians/  ← Public roster (sanitized, zero secret leaks)
│   │   │   │   ├── vault/        ← Personal watch vault items (mass-assignment protected)
│   │   │   │   ├── reviews/      ← Authentic verified reviews (completed bookings only)
│   │   │   │   └── eta/          ← Protected Distance Matrix transit calculation
│   │   │   ├── loading.tsx       ← Luxury horological escapement pulse loader
│   │   │   ├── not-found.tsx     ← Bespoke 404 Atelier registry page
│   │   │   ├── error.tsx         ← Client error boundary with re-calibration trigger
│   │   │   └── global-error.tsx  ← Root catastrophic exception boundary
│   │   ├── components/           ← Curated UI components, Loupe visualizer, Live Radar
│   │   ├── lib/
│   │   │   ├── roles.ts          ← Centralized admin email & role scoping
│   │   │   ├── privacy.ts        ← PII masking for phone, email, and addresses
│   │   │   ├── pricing.ts        ← Authoritative single-source bookable service catalog
│   │   │   ├── booking-slots.ts  ← Date/time slot validation & capacity load-balancer
│   │   │   ├── payments.ts       ← Cryptographic HMAC gateway verification & simulation gate
│   │   │   ├── inventory.ts      ← Atomic stock reservation & catalog decrementing
│   │   │   └── guest.ts          ← Cryptographically strong order & service reference generator
│   │   └── store/                ← Zustand stores with variant-aware cart tracking
│   ├── eslint.config.mjs         ← ESLint 9 configuration with Next.js plugin
│   ├── next.config.ts            ← Security headers (CSP, X-Frame-Options, X-Content-Type)
│   └── .env.example              ← Complete environment template
```

---

## 🛠️ Security Hardening Implemented

- **Gateway Signature Validation**: Payment verification requires authentic Razorpay HMAC-SHA256 signatures matching the generated order. Unverified or simulated payments are strictly rejected in production environments unless `ALLOW_SIMULATED_PAYMENTS="true"`.
- **Server-Side Pricing Authority**: Timepiece orders and repair bookings derive prices and deposits exclusively from the server-side database and `src/lib/pricing.ts`. Client-sent totals are never trusted.
- **Stock Depletion Safeguards**: Catalog stock is atomically validated and decremented on payment verification, preventing overselling of unique horological assets.
- **Technician Privacy**: Public technician endpoints (`/api/technicians` and `/api/technicians/[id]`) omit `twoFactorSecret`, personal phone numbers, and emails unless accessed by an authenticated administrator.
- **Role-Scoped Mutations**: Booking updates enforce role boundaries. Customers can only cancel pending requests; technicians can only progress active jobs with arrival PIN verification; only administrators can reassign technicians or alter financial records.
- **Privacy & PII Masking**: Unauthenticated or guest lookups for orders and service dossiers automatically mask residential addresses, phone numbers, and email identities.
- **Cookie Bloat Prevention**: Data URLs and oversized strings are stripped from NextAuth JWT tokens, avoiding HTTP 431 Request Header Fields Too Large errors.
- **Database Index Optimization**: High-frequency lookups on `orders`, `repair_bookings`, `reviews`, `notifications`, `addresses`, and `watch_vault_items` are backed by database indices.

---

## 🚀 Local Development Setup

### 1. Install Dependencies

```bash
cd wristloom-frontend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` and populate with your credentials:

```bash
cp .env.example .env.local
```

### 3. Sync Database Schema & Apply RLS

```bash
# Push Prisma schema and indexes to PostgreSQL
npx prisma db push

# Generate fresh Prisma Client
npx prisma generate
```

To enable Row Level Security, execute `prisma/rls_policies.sql` in your Supabase SQL Editor.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Quality Assurance & Build Checks

```bash
# Run ESLint validation
npm run lint

# Run TypeScript typecheck
npx --no-install tsc --noEmit

# Run Next.js production build
npm run build
```
