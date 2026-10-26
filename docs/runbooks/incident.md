# Runbook: Incident Response & Public Communication
**Layer 14: Monitoring & Alerts (15-Layer SaaS Playbook, p. 30)**

## 1. Incident Severity Classification

| Level | Definition | Response Time | Actions |
|---|---|:---:|---|
| **SEV-1 (Critical)** | Core checkout down, payment gateway broken, database offline, data leak | < 15 minutes | Immediate page, executive escalation, trigger rollback or maintenance mode |
| **SEV-2 (High)** | Degradation in technician tracking, delayed email delivery, high latency | < 1 hour | Notify team, investigate logs, isolate affected subsystem |
| **SEV-3 (Low)** | Minor UI cosmetic glitch, non-blocking admin filter issue | Next business day | Log ticket and schedule sprint fix |

---

## 2. Incident Declaration & Communication Steps
1. **Declare**: Announce `#incident-active` with incident lead and short description.
2. **Mitigate**: Stop ongoing damage (rollback bad deploy, rotate compromised key, disable affected feature via feature flag).
3. **Communicate**: Update public status banner or email affected collectors with clear timeline and reassurance.
4. **Post-Mortem**: Conduct blameless post-mortem within 48 hours.

---

## 3. Post-Incident Review Template

```markdown
# Incident Post-Mortem: [Title]
**Date**: YYYY-MM-DD
**Duration**: X minutes
**Severity**: SEV-1 | SEV-2

### What Happened
[Concise summary of observed behavior and user impact]

### Root Cause
[Technical explanation of why the failure occurred]

### Timeline
- HH:MM UTC — Outage detected by /api/health alert
- HH:MM UTC — Team assembled; rollback triggered
- HH:MM UTC — Service verified healthy

### Corrective Actions
1. [Action item with assignee and due date]
2. [Add regression test reproducing failure]
```
