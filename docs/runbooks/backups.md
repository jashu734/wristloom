# Runbook: Database Backups & Point-in-Time Restore
**Layer 3: Databases & Storage (15-Layer SaaS Playbook, p. 9)**

## 1. Backup Schedule & Retention Policy
- **Automated Snapshots**: Handled by Supabase PostgreSQL daily at 00:00 UTC.
- **Retention Window**: 7 days rolling retention (Pro tier: 30 days point-in-time recovery).
- **Logical Dump Backup**: Weekly manual or scheduled pg_dump archive stored in isolated secure storage.

---

## 2. Step-by-Step Point-in-Time Restore Drill

### Option A: Supabase Dashboard Restore
1. Navigate to **Supabase Dashboard** -> `Project Settings` -> `Database` -> `Backups`.
2. Select the desired restore snapshot or point in time.
3. Choose **Restore to new project** or **In-place restore** (ensure non-destructive confirmation).
4. Verify application connectivity using `/api/health`.

### Option B: PostgreSQL CLI Dump & Restore

```bash
# 1. Take a full logical dump (schema and data)
pg_dump --clean --if-exists --no-owner -h aws-0-[REGION].pooler.supabase.com -U postgres -d postgres > wristloom_backup_$(date +%Y%m%d).sql

# 2. Test restoring into a staging/test database
psql -h localhost -U postgres -d wristloom_staging < wristloom_backup_$(date +%Y%m%d).sql

# 3. Verify record integrity
psql -h localhost -U postgres -d wristloom_staging -c "SELECT count(*) FROM orders; SELECT count(*) FROM repair_bookings;"
```
