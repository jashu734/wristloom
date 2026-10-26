# ADR 0003: Server-Side Pricing Authority & Stock Verification
**Status**: Accepted
**Date**: 2026-10-26

## Context
E-commerce applications are frequently vulnerable to client-side price tampering where malicious actors modify the total amount in the browser request payload before submission.

## Decision
Enforce absolute server-side pricing authority. All timepiece order totals and repair booking deposits are calculated exclusively from database records and `src/lib/pricing.ts`. Any client-submitted `totalAmount` or `depositAmount` is strictly ignored and recalculated.

## Alternatives Considered
1. **Trusting Client Totals with Post-Hoc Audit**: Rejected due to unacceptable financial and fraud risk in high-value luxury horology.
2. **Pre-signed Price Tokens**: Evaluated, but direct database lookup is simpler and eliminates token expiration edge cases.

## Consequences
- **Positive**: Complete immunity to price manipulation vulnerabilities. Stock levels are verified and reserved atomically before payment orders are generated.
- **Negative**: Checkout requires reading authoritative product records from PostgreSQL, which is mitigated by database index coverage on `slug`, `referenceNumber`, and `id`.
