# Database & Storage Review: Wristloom Platform
**Layer 3: Databases & Storage (15-Layer SaaS Playbook, p. 8-9)**

## 1. Schema Correctness & Indexing Review

The Prisma schema ([prisma/schema.prisma](file:///e:/WristLoom/wristloom-frontend/prisma/schema.prisma)) models the complete digital atelier domain across users, addresses, technicians, repair bookings, watch vault items, service history, products, carts, orders, and order items.

### High-Frequency Index Coverage
- `orders`: Indexed on `[userId]`, `[userId, createdAt]`, `[status]`, `[paymentStatus]`, `[createdAt]`.
- `repair_bookings`: Indexed on `[customerId]`, `[technicianId]`, `[status]`, `[scheduledDate]`.
- `products`: Indexed on `[isActive, createdAt]`, `[brand]`, `[price]`, with unique constraint on `slug`.
- `watch_vault_items`: Indexed on `[ownerId]`.
- `addresses`: Indexed on `[userId]`.
- `technician_locations`: Compound index on `[bookingId, recordedAt]` and `[technicianId, recordedAt]`.

---

## 2. Query Efficiency & N+1 Prevention
- **Eager Loading**: Relations are explicitly joined using Prisma `include` blocks rather than sequential query loops (e.g. `include: { orderItems: true, user: true }`).
- **Bounded Pagination**: `findMany` queries on `/api/orders` and `/api/bookings` now include `take` and `skip` parameters (default 20, max 100) alongside parallel `count` queries to prevent memory exhaustion.
- **Selective Projections**: Sensitive user fields (`passwordHash`, `twoFactorSecret`) are omitted from queries using explicit `select` blocks.

---

## 3. Financial Precision
- Prices are stored as numbers representing whole INR units.
- Gateway interactions (Razorpay) explicitly multiply rupee values by 100 to convert to integer minor units (paise) as required by banking gateways, eliminating fractional cent rounding errors.

---

## 4. File Storage Strategy
- Public imagery (static brand assets and watch product photography) is served via optimized Next.js image loaders and CDN.
- User-uploaded imagery (watch vault inspection photos, service receipts) is managed via authenticated Supabase Storage buckets, preventing arbitrary executable uploads to application instances.
