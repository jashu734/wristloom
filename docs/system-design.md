# System Design: Wristloom Digital Atelier & Care Platform
**Layer 1: System Design (15-Layer SaaS Playbook, p. 4-5)**

## 1. Problem Statement
Luxury horology acquisition and high-end mechanical timepiece maintenance historically suffer from opaque servicing standards, unverified technician credentials, prolonged workshop turnarounds, and vulnerability to counterfeit components. Wristloom provides an integrated, white-glove digital atelier offering certified luxury timepiece acquisition, on-site certified horologist repair visits with live technician radar tracking, and personal digital watch vault management.

---

## 2. Target Users & Roles

1. **Valued Collectors / Customers (`CUSTOMER`)**:
   - Acquire certified timepieces with insured transit.
   - Schedule white-glove home appointments for diagnostics, overhaul, and water-resistance testing.
   - Track assigned technicians in real time with arrival radar.
   - Maintain digital vault records with service history and warranty certificates.
2. **Certified Master Horologists (`TECHNICIAN`)**:
   - Receive geocached repair bookings load-balanced by queue.
   - Broadcast live transit telemetry en route to customer destinations.
   - Complete multi-point diagnostic checks and finalize service with customer PIN authentication.
3. **Atelier Concierge Administrators (`ADMIN`)**:
   - Oversee inventory allocations, order fulfillment, and dispute escalations.
   - Reassign technicians and review platform financial metrics.

---

## 3. Tenancy & Isolation Model
- **Model**: Single-Platform Multi-User (B2C Luxury Atelier).
- **Data Isolation**:
  - Customer records, digital vault assets, and orders are strictly user-scoped (`userId` / `ownerId` / `customerId`).
  - Cross-user queries strictly return **HTTP 404** (not 403) to prevent resource ID enumeration attacks.
  - Technicians only view service addresses and client names for bookings actively assigned to them.
  - Sensitive technician contact details (personal phone/email) and customer PII are masked on public endpoints.

---

## 4. Non-Functional Requirements

| Dimension | Target Standard | Controls & Mechanisms |
|---|---|---|
| **Security** | OWASP Top 10 hardened | Bcrypt (12 rounds), HMAC-SHA256 signature verification, strict server-side price calculation, constant-time auth compare |
| **Availability** | 99.9% Uptime | Stateless Next.js App Router, edge-distributed CDN via Vercel, serverless connection pooling via Supabase |
| **Latency** | p95 < 300ms | Edge caching for public marketing pages, database indexes on foreign keys and lookup queries, fast JSON serialization |
| **Data Integrity** | Zero overselling | Atomic inventory stock reservation and transactional decrementing on verified payment |

---

## 5. Capacity Back-of-the-Envelope Model (Year One)

- **Active Registered Collectors**: 25,000 collectors.
- **Peak Traffic**:
  - Average Daily Visits: 5,000 visitors/day.
  - Peak Request Rate: ~15 to 25 requests per second (RPS) during luxury drops or marketing campaigns.
- **Database Sizing**:
  - Products: ~500 SKUs (~10MB including metadata and specifications).
  - Orders: ~10,000 orders/year (~25MB with line items).
  - Repair Bookings: ~15,000 appointments/year (~50MB including location logs).
  - Total Database Size Year 1: < 500MB (comfortably within Supabase starter / pro tiers).
- **Object Storage**:
  - Watch Vault Photos & Inspection Shots: ~50,000 images at 1.5MB average = ~75GB.
  - Handled directly via cloud object storage (Supabase Storage / S3) with pre-signed CDN links.
- **Identified Bottlenecks**:
  1. *Realtime Location Updates*: Addressed via Supabase Realtime broadcast channels rather than continuous database write loops.
  2. *Cold-Start Database Connection Overhead*: Mitigated via Prisma driver adapter over Supabase connection pooler (`pgbouncer` port 6543).

---

## 6. Out-of-Scope Boundaries
- Multi-brand marketplace where external third-party merchants sell unvetted inventory (Wristloom is an exclusive, curated atelier).
- Physical cryptocurrency payment settlement (all payments settled via INR Razorpay gateway or white-glove inspection handover).
- Automatic autonomous drone delivery (all deliveries handled by bonded couriers or master horologists).
