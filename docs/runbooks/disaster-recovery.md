# Runbook: Disaster Recovery & Business Continuity
**Layer 16: Additional SaaS Features (15-Layer SaaS Playbook, p. 34)**

## 1. Objectives
- **Recovery Point Objective (RPO)**: < 24 Hours (data loss capped at last night's automated snapshot).
- **Recovery Time Objective (RTO)**: < 2 Hours (complete platform re-establishment in secondary environment).

---

## 2. Disaster Scenarios & Recovery Procedures

### Scenario A: Primary Database Provider Catastrophic Outage
1. Provision a fresh PostgreSQL instance on alternative cloud (e.g. AWS RDS or Neon).
2. Restore latest logical dump `wristloom_backup_*.sql`.
3. Update `DATABASE_URL` and `DIRECT_URL` in Vercel project environment settings.
4. Redeploy project; verify connectivity via `/api/health`.

### Scenario B: Payment Gateway Service Outage (Razorpay Outage)
1. Set `paymentMethod` default to `concierge` (White-Glove Handover) in checkout.
2. In-person or delivery-handover inspection and settlement allows business continuity while gateway recovers.

### Scenario C: Accidental Production Table Truncation / Data Destruction
1. Stop deployment writes immediately.
2. Access Supabase point-in-time restore tool.
3. Restore database state to timestamp immediately preceding the destructive operation.
4. Re-verify record counts before lifting maintenance pause.
