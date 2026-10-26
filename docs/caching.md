# Caching & CDN Strategy: Wristloom
**Layer 12: Caching & CDN (15-Layer SaaS Playbook, p. 26-27)**

## 1. Caching Policy Matrix

| Asset / Endpoint | Layer | TTL | Cache-Control Header | Invalidation Event |
|---|---|---|---|---|
| **Static Assets (JS/CSS/Fonts)** | CDN (Vercel Edge) | 1 Year | `public, max-age=31536000, immutable` | Automatic on new production deployment hash |
| **Optimized Watch Images** | CDN | 24 Hours | `public, max-age=86400, stale-while-revalidate=604800` | Static asset update |
| **Public Roster (`/api/technicians`)** | Edge / CDN | 60 Seconds | `public, s-maxage=60, stale-while-revalidate=300` | Automatic revalidation |
| **Authenticated Data (`/api/orders`, `/api/vault`)** | None | 0 Seconds | `private, no-cache, no-store, must-revalidate` | Never cached |
| **Health Check (`/api/health`)** | None | 0 Seconds | `no-cache, no-store` | Always dynamic |

---

## 2. Core Rule of SaaS Caching
**Never cache authenticated or user-scoped data at a shared CDN layer.**
All endpoints returning personal collector orders, addresses, or watch vault entries strictly return `Cache-Control: private, no-store` to prevent cross-collector data leakage.
