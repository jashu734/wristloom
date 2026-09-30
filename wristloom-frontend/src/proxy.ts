// ============================================================
// Wristloom — Next.js 16 Proxy (formerly middleware)
// Route protection using JWT session — no Prisma (Edge-safe)
// ============================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Helper to resolve JWT session token across local and production (HTTPS / secure cookies)
async function getAuthToken(req: NextRequest) {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  const isSecure =
    req.nextUrl.protocol === 'https:' ||
    req.headers.get('x-forwarded-proto') === 'https' ||
    process.env.NODE_ENV === 'production';

  // 1. Primary: Auth.js v5 standard (detects __Secure-authjs.session-token on HTTPS)
  let token = await getToken({ req, secret, secureCookie: isSecure });
  if (token) return token;

  // 2. Fallback: non-secure cookie name (authjs.session-token)
  token = await getToken({ req, secret, secureCookie: false });
  if (token) return token;

  // 3. Fallback: NextAuth v4 cookie names (__Secure-next-auth.session-token / next-auth.session-token)
  token = await getToken({
    req,
    secret,
    cookieName: isSecure ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
  });
  if (token) return token;

  token = await getToken({ req, secret, cookieName: 'next-auth.session-token' });
  if (token) return token;

  // 4. Secondary secret fallback if NEXTAUTH_SECRET differs from AUTH_SECRET
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET !== process.env.AUTH_SECRET) {
    token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, secureCookie: isSecure });
    if (token) return token;
    token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, secureCookie: false });
    if (token) return token;
  }

  return null;
}

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ── Public routes — always accessible ──────────────────────
  const isPublic =
    pathname === '/' ||
    pathname.startsWith('/shop') ||
    pathname.startsWith('/cart') ||
    pathname.startsWith('/wishlist') ||
    pathname.startsWith('/products') ||
    pathname.startsWith('/orders') ||
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
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon');

  // ── Already logged in users visiting /login or /register ─────────
  if (pathname === '/login' || pathname === '/register') {
    const token = await getAuthToken(req);
    if (token) {
      const emailLower = (token.email as string | undefined)?.toLowerCase().trim();
      const role = (token.role as string) || (emailLower === 'wristloom@gmail.com' ? 'ADMIN' : 'CUSTOMER');
      if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      if (role === 'TECHNICIAN') return NextResponse.redirect(new URL('/technician/dashboard', req.url));
      return NextResponse.redirect(new URL('/customer/dashboard', req.url));
    }
    return NextResponse.next();
  }

  if (isPublic) return NextResponse.next();

  // ── Get JWT token for protected routes (Edge-safe) ──────────────
  const token = await getAuthToken(req);

  // ── Unauthenticated → login with callbackUrl ─────────────────
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const emailLower = (token.email as string | undefined)?.toLowerCase().trim();
  const role = (token.role as string) || (emailLower === 'wristloom@gmail.com' ? 'ADMIN' : 'CUSTOMER');

  // ── Technician-only routes ──────────────────────────────────
  if (pathname.startsWith('/technician') && role !== 'TECHNICIAN' && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/customer/dashboard', req.url));
  }

  // ── Admin-only routes ───────────────────────────────────────
  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    if (role === 'TECHNICIAN') {
      return NextResponse.redirect(new URL('/technician/dashboard', req.url));
    }
    return NextResponse.redirect(new URL('/customer/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
