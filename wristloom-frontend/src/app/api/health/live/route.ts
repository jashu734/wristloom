// ============================================================
// Wristloom — Lightweight Liveness Check
// Layer 14: Monitoring & Alerts (15-Layer SaaS Playbook, p. 30)
// Fast ping for load balancers & container orchestrators.
// ============================================================

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
