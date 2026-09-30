// ============================================================
// Wristloom — HTTP & Request Helper Utilities
// Safe IP parsing, standard JSON responses, and error handling
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

export function getClientIp(req: NextRequest | Request): string {
  if ('headers' in req) {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
      // Pick first public IP, ignoring internal hops
      const ips = forwarded.split(',').map((ip) => ip.trim());
      if (ips[0]) return ips[0];
    }
    const realIp = req.headers.get('x-real-ip');
    if (realIp) return realIp.trim();
  }
  return '127.0.0.1';
}

export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message, success: false }, { status });
}

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}
