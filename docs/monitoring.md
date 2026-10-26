# Monitoring & Observability Plan: Wristloom
**Layer 14: Monitoring & Alerts (15-Layer SaaS Playbook, p. 30-31)**

## 1. Uptime & Synthetic Health Checks

| Target URL | Frequency | Expected Status | Action on Failure |
|---|---|:---:|---|
| `https://wristloom.vercel.app/api/health/live` | Every 60s | HTTP 200 `{"status":"ok"}` | Alert DevOps on 2 consecutive failures |
| `https://wristloom.vercel.app/api/health` | Every 5m | HTTP 200 `{"status":"healthy"}` | Alert Database Administrator if DB unhealthy |
| `https://wristloom.vercel.app/` | Every 5m | HTTP 200 | Alert Frontend team |

---

## 2. Key Technical & Business Metrics
- **Technical Metrics**:
  - API p95 Latency: Target < 300ms.
  - Database Ping Latency: Target < 50ms.
  - Server Error Rate: Target < 0.1% of total requests.
  - Rate Limit Trigger Count: Monitor for brute-force spikes.
- **Business Metrics**:
  - Daily Completed Acquisitions: Track GMV and confirmed orders.
  - Active Service Bookings: Monitor technician job backlog.
  - Failed Payment Gateway Transactions: Investigate if spike > 5% within 1 hour.

---

## 3. Recommended External Monitoring Setup
- **Uptime Monitoring**: Configure **Better Stack Uptime** or **UptimeRobot** targeting `/api/health`.
- **Alert Channel**: Forward critical outages to Discord/Slack DevOps webhook and SMS/pager.
