# Testing Strategy: Wristloom Platform
**Layer 8: Testing (15-Layer SaaS Playbook, p. 18-19)**

## 1. Multi-Tiered Testing Strategy

```text
       ┌───────────────────────────────┐
       │     End-to-End (E2E)          │  Critical flows: Login, Checkout, Service Booking
       │   Automated Browser Scenarios │
       ├───────────────────────────────┤
       │     Integration Testing       │  API endpoints, Zod validation, Webhooks,
       │   Database & Gateway Sim      │  Pagination, Permissions Engine
       ├───────────────────────────────┤
       │        Unit Testing           │  Pricing calculations, HMAC SHA-256 checks,
       │   Pure Business Logic         │  PII masking, Token sanitation
       └───────────────────────────────┘
```

---

## 2. Mocking Guidelines
- **What is NEVER mocked**:
  - Permissions and role checks (`src/lib/permissions.ts`).
  - Cryptographic signature generation and timing-safe comparisons.
  - Zod request body schemas and validation rules.
- **What is mocked**:
  - Outgoing external HTTP calls to Resend email API.
  - External banking gateway webhooks (replayed via deterministic fixture payloads).

---

## 3. Running Automated Tests

```bash
# Execute full automated test suite
npm test

# Run TypeScript type check
npm run typecheck

# Run ESLint validation
npm run lint
```

---

## 4. Golden Rules of Testing (Appendix A, p. 35)
1. **Never edit a test to pass**: If a test reveals a bug, the bug must be fixed in the application code.
2. **No silent skipping**: Every test must run and report explicit pass/fail output.
3. **Assert on real behavior**: Verify the database state and HTTP response code rather than mock stubs.
