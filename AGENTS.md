# Project: Wristloom — Haute Horlogerie Digital Atelier & Care Platform
**Project Memory & Guidelines (15-Layer SaaS Playbook, Part 0, p. 2-3)**

## What this product does
Wristloom is a premier, full-stack digital ecosystem for luxury timepiece acquisition, professional authentication, white-glove house-call maintenance, live technician radar tracking, and personal digital vault management.

## Stack (do not change without asking)
- **Frontend**: Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + Radix UI
- **Backend**: Next.js API Routes (Serverless Modular Monolith)
- **Database**: PostgreSQL via Supabase, ORM: Prisma 7.10 (`@prisma/adapter-pg` / `@prisma/client`)
- **Auth**: NextAuth.js v5 (JWT Strategy, Google OAuth 2.0 + bcrypt)
- **Payments**: Razorpay (HMAC-SHA256 signature verification + Webhooks)
- **Email**: Resend Transactional Email API
- **Hosting**: Vercel (Edge CDN + Serverless) + Supabase Managed PostgreSQL

## Rules
- **Never commit secrets**: All secrets must go in environment variables, documented in `.env.example`.
- **Every new API endpoint needs**: Input validation (Zod), auth check, authorization check (`can(user, action, resource)`), and automated tests.
- **Database schema changes**: Every schema change must go through Prisma migrations. Never edit the database by hand.
- **Verification standard**: Always run `npm run lint`, `npx tsc --noEmit`, and `npm test` before declaring a task complete.
- **Zero client trust**: Pricing, permissions, and inventory stock deductions are strictly calculated on the server-side.
- **Cross-user isolation (IDOR protection)**: Any query for another user's unowned resource must return **HTTP 404** (not 403) to prevent ID enumeration.

## Commands
- **Dev**: `npm run dev`
- **Test**: `npm test` (Runs native test suite in `wristloom-frontend/tests/`)
- **Lint**: `npm run lint`
- **Typecheck**: `npx tsc --noEmit` (in `wristloom-frontend`)
- **Build**: `npm run build`
- **Health Check**: `curl -i http://localhost:3000/api/health`

## Architecture Decisions
See [docs/decisions/](file:///e:/WristLoom/docs/decisions/) for the log of architectural decision records:
- [0001: Consolidation into Next.js Modular Monolith](file:///e:/WristLoom/docs/decisions/0001-modular-monolith-consolidation.md)
- [0002: JWT Session Strategy with Edge-Safe Middleware](file:///e:/WristLoom/docs/decisions/0002-jwt-session-strategy.md)
- [0003: Server-Side Pricing Authority & Stock Verification](file:///e:/WristLoom/docs/decisions/0003-server-side-pricing-authority.md)

## Documentation Suite
- [Comprehensive SaaS Audit](file:///e:/WristLoom/docs/saas-audit.md)
- [Implementation Roadmap](file:///e:/WristLoom/docs/implementation-roadmap.md)
- [System Design Document](file:///e:/WristLoom/docs/system-design.md)
- [System Architecture](file:///e:/WristLoom/docs/architecture.md)
- [Database Review](file:///e:/WristLoom/docs/database-review.md)
- [API Conventions](file:///e:/WristLoom/docs/api-conventions.md)
- [Permissions Matrix](file:///e:/WristLoom/docs/permissions.md)
- [Security Threat Model](file:///e:/WristLoom/docs/security/threat-model.md)
- [Testing Strategy](file:///e:/WristLoom/docs/testing.md)
- [Hosting Architecture](file:///e:/WristLoom/docs/hosting.md)
- [Caching Strategy](file:///e:/WristLoom/docs/caching.md)
- [Monitoring Plan](file:///e:/WristLoom/docs/monitoring.md)
- [Deployment Runbook](file:///e:/WristLoom/docs/runbooks/deploy.md)
- [Rollback Runbook](file:///e:/WristLoom/docs/runbooks/rollback.md)
- [Backups & Restore Runbook](file:///e:/WristLoom/docs/runbooks/backups.md)
- [Incident Response Runbook](file:///e:/WristLoom/docs/runbooks/incident.md)
- [Disaster Recovery Runbook](file:///e:/WristLoom/docs/runbooks/disaster-recovery.md)
