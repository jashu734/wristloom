# Threat Model: Wristloom Luxury Atelier Platform
**Layer 10: Security (15-Layer SaaS Playbook, p. 22-23)**

## 1. Primary Assets
1. **Collector PII**: Full legal names, delivery addresses, mobile numbers, and email identities.
2. **Horological Provenance & Valuations**: Watch serial numbers, authenticity certificates, acquisition invoices, and vault collections.
3. **Financial Gateways & Secrets**: Razorpay HMAC secrets, API keys, and payment verification parameters.
4. **Physical Safety & Telemetry**: Live GPS coordinates of horologists en route with valuable timepieces.

---

## 2. Attack Surface & Threat Analysis (OWASP Top 10)

| Entry Point / Vector | OWASP Threat | Likelihood | Impact | Mitigation Implemented |
|---|---|:---:|:---:|---|
| **`/api/payments/verify` & `/api/payments/webhook`** | Insecure Payment Tampering & Signature Forgery | High | Critical | Cryptographic HMAC-SHA256 signature verification matching raw gateway payloads. Idempotent event ID tracking. Zero client-reported prices trusted. |
| **`/api/vault/[id]` & `/api/orders/[id]`** | Broken Object Level Authorization (IDOR) | High | High | Server-side `ownerId` / `customerId` verification. Unowned resource lookups return **HTTP 404** to prevent ID enumeration. |
| **`/api/auth/verify-login` & `/api/auth/register`** | Credential Stuffing & User Enumeration | High | High | Constant-time bcrypt hash comparison using dummy hash. Identical error response for invalid password and non-existent email. Per-IP and per-account rate limiting with `Retry-After`. |
| **`/api/technicians`** | Information Disclosure (Technician PII) | Medium | Medium | Public roster strips personal mobile numbers and personal email addresses unless caller is an authenticated administrator. |
| **User Input Forms** | Cross-Site Scripting (XSS) | Medium | High | React 19 automatic JSX string escaping. Content-Security-Policy headers configured in `next.config.ts`. |
| **Database Queries** | SQL Injection | Low | Critical | Prisma ORM parameterizes all relational queries; no raw unsanitized SQL string concatenation. |

---

## 3. Data Protection Controls
- **At Rest**: PostgreSQL storage encrypted at rest via Supabase managed database keys.
- **In Transit**: Mandatory TLS 1.3 encryption across all public and internal service calls.
- **In Logs**: Automated JSON redactor sanitizes keys named `password`, `token`, `secret`, `signature`, and `authorization`.
