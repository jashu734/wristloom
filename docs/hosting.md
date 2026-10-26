# Hosting & Cloud Architecture: Wristloom
**Layer 9: Hosting & Cloud (15-Layer SaaS Playbook, p. 20-21)**

## 1. Hosting Architecture
- **Frontend & Edge API Routes**: Deployed on **Vercel** serverless infrastructure with global CDN edge routing.
- **Database & Storage**: Managed **Supabase PostgreSQL** with automated daily snapshots and connection pooling via PgBouncer.
- **DNS & Domains**: HTTPS enforced with automated TLS certificate management via Vercel Edge.

---

## 2. Environment Configuration Matrix

| Variable | Environment | Required | Description |
|---|---|:---:|---|
| `NODE_ENV` | All | Yes | `development`, `test`, or `production` |
| `DATABASE_URL` | All | Yes | Transaction-pooled PostgreSQL connection URI (port 6543) |
| `DIRECT_URL` | All | No | Direct connection URI for migrations (port 5432) |
| `AUTH_SECRET` | All | Yes | Cryptographic secret for signing JWT session cookies |
| `RAZORPAY_KEY_ID` | All | Yes | Public key for initiating gateway transactions |
| `RAZORPAY_KEY_SECRET` | Server | Yes | Private secret for verifying HMAC SHA-256 signatures |
| `RAZORPAY_WEBHOOK_SECRET` | Server | Yes | Secret for authenticating incoming payment webhooks |
| `RESEND_API_KEY` | Server | Optional | API key for transactional email delivery |
| `NEXT_PUBLIC_APP_URL` | All | Yes | Fully qualified canonical domain URL |

---

## 3. Security Headers
Configured in `next.config.ts`:
- `X-Frame-Options: SAMEORIGIN` (Clickjacking prevention)
- `X-Content-Type-Options: nosniff` (MIME sniffing prevention)
- `Referrer-Policy: strict-origin-when-cross-origin` (Privacy protection)
- `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`
