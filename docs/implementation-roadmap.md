# Implementation Roadmap: Production Hardening
**Prioritized by Risk, User Impact, Dependencies, and Benefit**

This roadmap structures the remediation and upgrade tasks identified in [docs/saas-audit.md](file:///e:/WristLoom/docs/saas-audit.md) into 5 sequential, verifiable phases based on the 15-Layer SaaS Playbook.

---

## Phase Overview & Priority Matrix

| Phase | Focus Area | Primary Deliverables | Risk Addressed | Implementation Effort | Expected Benefit |
|---|---|---|---|---|---|
| **Phase A** | Critical Safety & Reliability | Razorpay Webhook Handler, Startup Env Validator, Centralized Permissions | Critical | Medium | Prevents payment desynchronization, bad deployments, and authorization drift |
| **Phase B** | Core Application Correctness | Health check endpoints (`/api/health`, `/api/health/live`), list pagination, transactional email dispatcher | High | Medium | Eliminates OOM query risks, enables uptime monitoring, and ensures customer order communications |
| **Phase C** | Product Quality & Accessibility | Accessibility (labels & focus rings), WCAG 2.1 AA compliance, data export & deletion endpoints | Medium | Low | Enhances accessibility and satisfies privacy/data-protection expectations |
| **Phase D** | Testing & Delivery | Automated test runner (`vitest` / native runner), unit & integration tests, GitHub Actions CI workflow | Critical | Medium | Guarantees regression protection on every commit and automated CI gatekeeping |
| **Phase E** | Operational Readiness & Architecture | Structured JSON logging with redaction & request IDs, enhanced rate limiting with `Retry-After`, runbooks, and load testing | Medium | Low | Comprehensive production observability, incident preparedness, and scaling resilience |

---

## Phase A: Critical Safety & Reliability

### 1. Razorpay Webhook Endpoint (`/api/payments/webhook`)
- **Risk**: Critical
- **Gap**: Payment confirmation currently relies entirely on browser redirect (`/api/payments/verify`). If a buyer closes the tab or loses connection immediately after authorizing payment, the gateway charges them, but the platform database remains `UNPAID`.
- **Files**:
  - Create: [src/app/api/payments/webhook/route.ts](file:///e:/WristLoom/wristloom-frontend/src/app/api/payments/webhook/route.ts)
  - Modify: [src/lib/payments.ts](file:///e:/WristLoom/wristloom-frontend/src/lib/payments.ts)
- **Controls**:
  - Gateway signature verification using `RAZORPAY_WEBHOOK_SECRET`.
  - Idempotent processing by recording processed payment/order events.
  - Handles `payment.captured`, `payment.failed`, `order.paid`.
  - Atomically decrements catalog stock and generates confirmation notification.

### 2. Runtime Environment Validation (`src/lib/env.ts`)
- **Risk**: High
- **Gap**: Application starts without verifying required secrets (`AUTH_SECRET`, `DATABASE_URL`, `RAZORPAY_KEY_ID`), leading to cryptic failures deep in request handlers.
- **Files**:
  - Create: [src/lib/env.ts](file:///e:/WristLoom/wristloom-frontend/src/lib/env.ts)
  - Update: [src/app/layout.tsx](file:///e:/WristLoom/wristloom-frontend/src/app/layout.tsx) or startup entry
- **Controls**:
  - Zod schema validating server and client variables on boot.
  - Fails loudly with clear diagnostics if required variables are missing or malformed.

### 3. Centralized Authorization Engine (`src/lib/permissions.ts`)
- **Risk**: High
- **Gap**: Role checks are scattered across route files (`isAdminEmail`, inline role string comparisons).
- **Files**:
  - Create: [src/lib/permissions.ts](file:///e:/WristLoom/wristloom-frontend/src/lib/permissions.ts)
  - Create: [docs/permissions.md](file:///e:/WristLoom/docs/permissions.md)
- **Controls**:
  - Unified `can(user, action, resource)` policy evaluator.
  - Strict enforcement of `CUSTOMER`, `TECHNICIAN`, and `ADMIN` capabilities.

---

## Phase B: Core Application Correctness

### 1. Real Health Check Endpoint (`/api/health` and `/api/health/live`)
- **Risk**: High
- **Gap**: No health endpoint for load balancers, Vercel health monitoring, or UptimeRobot.
- **Files**:
  - Create: [src/app/api/health/route.ts](file:///e:/WristLoom/wristloom-frontend/src/app/api/health/route.ts)
  - Create: [src/app/api/health/live/route.ts](file:///e:/WristLoom/wristloom-frontend/src/app/api/health/live/route.ts)
- **Controls**:
  - `/api/health`: Queries database with a 3-second timeout, verifies environment status, returns component-level JSON report.
  - `/api/health/live`: Lightweight process-liveness check for load balancer pinging.

### 2. Bounded List Queries & Cursor Pagination
- **Risk**: Medium
- **Gap**: [src/app/api/orders/route.ts](file:///e:/WristLoom/wristloom-frontend/src/app/api/orders/route.ts) and [src/app/api/bookings/route.ts](file:///e:/WristLoom/wristloom-frontend/src/app/api/bookings/route.ts) execute unbounded `findMany` queries.
- **Files**:
  - Modify: [src/app/api/orders/route.ts](file:///e:/WristLoom/wristloom-frontend/src/app/api/orders/route.ts)
  - Modify: [src/app/api/bookings/route.ts](file:///e:/WristLoom/wristloom-frontend/src/app/api/bookings/route.ts)
- **Controls**:
  - Support `limit` (default 20, max 100), `page`, and cursor parameters.
  - Return pagination metadata (`total`, `page`, `totalPages`, `hasMore`).

### 3. Transactional Email Dispatcher (`src/lib/email.ts`)
- **Risk**: Medium
- **Gap**: Order and booking confirmations are recorded only in-app, not dispatched via email to buyers or clients.
- **Files**:
  - Create: [src/lib/email.ts](file:///e:/WristLoom/wristloom-frontend/src/lib/email.ts)
- **Controls**:
  - Resend client with luxury horological email templates (Order Acquisition Receipt, Repair Confirmation).
  - Graceful mock/no-op logging when `RESEND_API_KEY` is not configured in local environment.

---

## Phase C: Product Quality & Data Protection

### 1. Data Privacy: Self-Service Data Export & Account Anonymization
- **Risk**: Medium
- **Gap**: Users cannot export their watch vault and order records, nor request account data deletion under data privacy guidelines.
- **Files**:
  - Create: [src/app/api/user/export/route.ts](file:///e:/WristLoom/wristloom-frontend/src/app/api/user/export/route.ts)
  - Create: [src/app/api/user/delete/route.ts](file:///e:/WristLoom/wristloom-frontend/src/app/api/user/delete/route.ts)
- **Controls**:
  - Export: Generates downloadable JSON payload containing user's profile, addresses, orders, and vault timepieces.
  - Delete: Anonymizes personal identifiable information (name, email, phone) and detaches sessions while preserving historical order financial records.

### 2. Form Accessibility & Prevention of Duplicate Submissions
- **Risk**: Medium
- **Gap**: Checkout form inputs rely on placeholders without associated labels; pending state submission locking needs verification.
- **Files**:
  - Update: [src/app/cart/page.tsx](file:///e:/WristLoom/wristloom-frontend/src/app/cart/page.tsx)
  - Update: [src/components/booking/BookingModal.tsx](file:///e:/WristLoom/wristloom-frontend/src/components/booking/BookingModal.tsx)

---

## Phase D: Automated Testing & Continuous Integration

### 1. Automated Test Suite Setup (`npm test`)
- **Risk**: Critical
- **Gap**: `package.json` lacks an automated test command; tests were executed manually via ad-hoc scripts.
- **Files**:
  - Update: [wristloom-frontend/package.json](file:///e:/WristLoom/wristloom-frontend/package.json)
  - Create: `tests/` directory with unit tests for pricing, inventory, permissions, and API integration tests.
- **Controls**:
  - Zero-dependency Node.js test runner or Vitest to test business logic and API endpoints without introducing fragile dependencies.

### 2. GitHub Actions CI Pipeline (`.github/workflows/ci.yml`)
- **Risk**: High
- **Gap**: No automated CI validation runs on pull requests or commits to `main`.
- **Files**:
  - Create: [.github/workflows/ci.yml](file:///e:/WristLoom/.github/workflows/ci.yml)
- **Controls**:
  - Pipeline steps: Checkout → Setup Node.js (with npm cache) → Install dependencies → Lint → Typecheck (`tsc --noEmit`) → Automated Tests → Next.js Build.

---

## Phase E: Operational Readiness, Scaling & Runbooks

### 1. Structured JSON Logger with Request IDs & PII Redaction
- **Risk**: Medium
- **Gap**: Standard `console.log` calls lack request tracing IDs and fail to redact sensitive tokens/signatures.
- **Files**:
  - Create: [src/lib/logger.ts](file:///e:/WristLoom/wristloom-frontend/src/lib/logger.ts)
- **Controls**:
  - Structured JSON format with levels: `DEBUG`, `INFO`, `WARN`, `ERROR`.
  - Automatic redaction of fields named `password`, `token`, `secret`, `authorization`, `razorpay_signature`.
  - Request ID injection into response headers (`x-request-id`).

### 2. Rate Limiting Hardening (`Retry-After` Header)
- **Risk**: Medium
- **Gap**: Rate limiter returns HTTP 429 without standard `Retry-After` header.
- **Files**:
  - Update: [src/lib/rate-limit.ts](file:///e:/WristLoom/wristloom-frontend/src/lib/rate-limit.ts)

### 3. Comprehensive Documentation & Operational Runbooks
- **Risk**: Low
- **Files**:
  - `docs/system-design.md`
  - `docs/architecture.md`
  - `docs/database-review.md`
  - `docs/api-conventions.md`
  - `docs/security/threat-model.md`
  - `docs/testing.md`
  - `docs/hosting.md`
  - `docs/caching.md`
  - `docs/monitoring.md`
  - `docs/runbooks/deploy.md`
  - `docs/runbooks/rollback.md`
  - `docs/runbooks/backups.md`
  - `docs/runbooks/incident.md`
  - `docs/runbooks/disaster-recovery.md`
  - Architecture Decision Records in `docs/decisions/`
  - `AGENTS.md` and `CLAUDE.md` updates.
