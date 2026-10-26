# Runbook: Production Deployment Procedure
**Layer 9 & 14 (15-Layer SaaS Playbook, p. 21)**

## 1. Pre-Deployment Verification Checklist
Before deploying changes to production, execute the following commands in `wristloom-frontend`:

```bash
# 1. Run ESLint code checks
npm run lint

# 2. Run TypeScript typecheck
npx tsc --noEmit

# 3. Run automated unit & integration test suite
npm test

# 4. Verify clean production build
npm run build
```

---

## 2. Production Deployment Steps (Vercel)

1. **Verify Environment Variables**:
   - Ensure `AUTH_SECRET`, `DATABASE_URL`, `RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET` are set in the Vercel Project Settings.
2. **Apply Database Migrations (if schema changed)**:
   ```bash
   npx prisma db push
   # OR for migration history:
   # npx prisma migrate deploy
   ```
3. **Trigger Deployment**:
   - Merge approved pull request into `main` branch to trigger automated GitHub Actions CI.
   - Vercel automatically deploys the verified commit.
4. **Post-Deploy Smoke Test**:
   - Query `https://wristloom.vercel.app/api/health` and verify `{"status":"healthy"}`.
   - Perform a simulated acquisition checkout to verify Razorpay modal initialization.
