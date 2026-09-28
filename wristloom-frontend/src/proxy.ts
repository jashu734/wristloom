// ============================================================
// Wristloom — Next.js 16 Proxy (formerly middleware)
// Route protection using JWT session — no Prisma (Edge-safe)
// ============================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ── Public routes — always accessible ──────────────────────
  const isPublic =
    pathname === '/' ||
    pathname.startsWith('/shop') ||
    pathname.startsWith('/cart') ||
    pathname.startsWith('/wishlist') ||
    pathname.startsWith('/products') ||
    pathname.startsWith('/authentication') ||
    pathname.startsWith('/trade-in') ||
    pathname.startsWith('/technicians') ||
    pathname.startsWith('/testimonials') ||
    pathname.startsWith('/reviews') ||
    pathname.startsWith('/community') ||
    pathname.startsWith('/workshops') ||
    pathname.startsWith('/care-guides') ||
    pathname.startsWith('/watch-care') ||
    pathname.startsWith('/restoration-gallery') ||
    pathname.startsWith('/investment-insights') ||
    pathname.startsWith('/faq') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/locations') ||
    pathname.startsWith('/warranty') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/services') ||
    pathname.startsWith('/service-tracking') ||
    pathname.startsWith('/shipping-policy') ||
    pathname.startsWith('/watch-vault') ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon');

  // ── Already logged in users visiting /login or /register ─────────
  if (pathname === '/login' || pathname === '/register') {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (token) {
      const role = token.role as string;
      if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin', req.url));
      if (role === 'TECHNICIAN') return NextResponse.redirect(new URL('/technician', req.url));
      return NextResponse.redirect(new URL('/account', req.url));
    }
    return NextResponse.next();
  }

  if (isPublic) return NextResponse.next();

  // ── Get JWT token (Edge-safe) ───────────────────────────────
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  // ── Unauthenticated → login ─────────────────────────────────
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string;

  // ── Technician-only routes ──────────────────────────────────
  if (pathname.startsWith('/technician') && role !== 'TECHNICIAN' && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/account', req.url));
  }

  // ── Admin-only routes ───────────────────────────────────────
  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    if (role === 'TECHNICIAN') {
      return NextResponse.redirect(new URL('/technician', req.url));
    }
    return NextResponse.redirect(new URL('/account', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
