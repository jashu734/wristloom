// ============================================================
// Wristloom — Deep Health Check API Route
// Layer 2 & 14: System Architecture & Monitoring (15-Layer SaaS Playbook, p. 7, 30)
// Verifies database connectivity, memory usage, and component health with timeouts.
// ============================================================

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateEnv } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, { status: 'healthy' | 'degraded' | 'unhealthy'; latencyMs?: number; message?: string }> = {};

  // 1. Process Liveness
  checks.process = {
    status: 'healthy',
    message: `Uptime ${Math.floor(process.uptime())}s`,
  };

  // 2. Environment Configuration
  const envCheck = validateEnv();
  checks.environment = {
    status: envCheck.valid ? 'healthy' : 'degraded',
    message: envCheck.valid ? 'All required variables configured' : 'Some non-critical variables missing',
  };

  // 3. PostgreSQL Database Connectivity (with 3-second timeout)
  const dbStart = Date.now();
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database ping timeout after 3000ms')), 3000)
    );
    const dbPingPromise = db.$queryRaw`SELECT 1 as ping`;

    await Promise.race([dbPingPromise, timeoutPromise]);
    checks.database = {
      status: 'healthy',
      latencyMs: Date.now() - dbStart,
      message: 'PostgreSQL connection active',
    };
  } catch (dbErr: any) {
    checks.database = {
      status: 'unhealthy',
      latencyMs: Date.now() - dbStart,
      message: dbErr.message || 'Database unreachable',
    };
  }

  // 4. Memory Usage Check
  const memoryUsage = process.memoryUsage();
  const heapUsedMb = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const heapTotalMb = Math.round(memoryUsage.heapTotal / 1024 / 1024);
  checks.memory = {
    status: heapUsedMb < 1024 ? 'healthy' : 'degraded',
    message: `Heap used: ${heapUsedMb}MB / Total: ${heapTotalMb}MB`,
  };

  const totalDurationMs = Date.now() - startTime;
  const isHealthy = Object.values(checks).every((c) => c.status !== 'unhealthy');

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      durationMs: totalDurationMs,
      checks,
    },
    { status: isHealthy ? 200 : 503 }
  );
}
