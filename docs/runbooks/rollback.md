# Runbook: Instant Deployment Rollback
**Layer 7: CI/CD & Version Control (15-Layer SaaS Playbook, p. 16)**

## 1. When to Trigger an Immediate Rollback
Roll back immediately if:
- `/api/health` reports status `unhealthy` for more than 2 minutes following deployment.
- Error rate spikes above 1% or critical customer checkout flows fail.
- Database connectivity is lost or schema migration fails.

---

## 2. Instant Rollback Procedure (Vercel)

1. Open the **Vercel Dashboard** -> Project `wristloom`.
2. Navigate to the **Deployments** tab.
3. Locate the previous known-good deployment.
4. Click the **Instant Rollback** button (or select `Promote to Production`).
5. Vercel shifts 100% of traffic to the previous deployment within seconds.

---

## 3. CLI Rollback Alternative

```bash
# Redeploy the previous Git commit hash
git checkout <previous-commit-hash>
git push origin <previous-commit-hash>:main --force-with-lease
```

---

## 4. Post-Rollback Investigation
- Review structured logs and Sentry error reports for the failing deployment.
- Identify failing endpoint or unhandled exception.
- Write a reproducing unit test before re-attempting deployment.
