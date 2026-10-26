# ADR 0002: JWT Session Strategy with Edge-Safe Middleware
**Status**: Accepted
**Date**: 2026-10-26

## Context
High-traffic luxury boutiques experience bursts of traffic during new drops and auctions. Validating sessions against the database on every single page request or static asset fetch introduces database connection saturation and latency spikes.

## Decision
Adopt NextAuth.js v5 with an encrypted, compact JWT cookie session strategy. Guard routes at the Edge proxy level without querying the database, while enforcing deep role and ownership checks on the server-side API boundary.

## Alternatives Considered
1. **Database Sessions (Session Table Lookups on Every Request)**: Rejected due to unnecessary read amplification on the Supabase PostgreSQL connection pool.
2. **Third-Party Auth-as-a-Service (Clerk / Auth0)**: Rejected to preserve database ownership in PostgreSQL and avoid high per-MAU SaaS fees.

## Consequences
- **Positive**: Blazing fast edge routing, zero database load on static page hits, stateless horizontal scaling.
- **Negative**: Immediate session revocation requires token expiry or database check throttling (mitigated by throttling DB user refreshes to once every 60 seconds in the JWT callback).
