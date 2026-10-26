# ADR 0001: Consolidation into Next.js Modular Monolith
**Status**: Accepted
**Date**: 2026-10-26

## Context
Wristloom previously had an experimental separate Express.js backend in `.archive/wristloom-backend` alongside the Next.js frontend. Managing two repositories and runtime environments introduced duplicated data types, synchronized deployment overhead, and cross-origin CORS complexities for sessions.

## Decision
Consolidate backend REST API routes, domain services, and Prisma database models directly into the Next.js 16 App Router (`src/app/api/` and `src/lib/`).

## Alternatives Considered
1. **Separate Express/Fastify Microservice**: Rejected due to unnecessary operational burden, dual server hosting costs, and token synchronization complexity for a small engineering team.
2. **tRPC Full-Stack Monorepo**: Evaluated, but Next.js standard REST endpoints provide universal compatibility for mobile apps, external payment webhooks, and third-party integrations.

## Consequences
- **Positive**: Single unified deployment pipeline on Vercel, zero CORS friction, shared TypeScript data types between UI and API routes, lower operational cost.
- **Negative**: Long-running background worker processes must be orchestrated via serverless webhooks or background job tools rather than persistent Node daemon loops.
