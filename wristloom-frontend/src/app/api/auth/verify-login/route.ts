// ============================================================
// Wristloom — Login Credential & Role Verification API
// Backend-enforced authority verifying intended role vs database role
// Constant-time responses to prevent email enumeration
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { loginLimiter } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/http';
import { isAdminEmail } from '@/lib/roles';

// Dummy hash for constant-time comparisons when email does not exist
const DUMMY_HASH = '$2a$12$e80yq5/1fQf2Z3eB7C8dseYyY54lGq1QhS1j2i3k4l5m6n7o8p9q0';

const verifySchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(128),
  intendedRole: z.enum(['CUSTOMER', 'TECHNICIAN']).default('CUSTOMER'),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const ipLimit = await loginLimiter.check(15, ip);
    if (!ipLimit.success) {
      return NextResponse.json(
        { error: 'Too many sign-in attempts. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase().trim();
    const password = parsed.data.password;
    const intendedRole = parsed.data.intendedRole;

    // Per-account rate limiting (prevents targeted credential stuffing)
    const accountLimit = await loginLimiter.check(10, `acct_${email}`);
    if (!accountLimit.success) {
      return NextResponse.json(
        { error: 'Too many attempts for this account. Please wait a minute.' },
        { status: 429 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        role: true,
      },
    });

    const hashToCompare = user?.passwordHash || DUMMY_HASH;
    const isValid = await bcrypt.compare(password, hashToCompare);

    if (!user || !user.passwordHash || !isValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Dedicated admin check
    const isDedicatedAdmin = isAdminEmail(email);
    let actualRole = user.role;
    if (isDedicatedAdmin && actualRole !== 'ADMIN') {
      await db.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
      });
      actualRole = 'ADMIN';
    }

    // Role verification against database authority
    if (actualRole === 'ADMIN') {
      return NextResponse.json({
        success: true,
        role: 'ADMIN',
        redirectUrl: '/admin/dashboard',
      });
    }

    if (intendedRole === 'TECHNICIAN') {
      if (actualRole !== 'TECHNICIAN') {
        return NextResponse.json(
          { error: 'This account is not registered as a technician.' },
          { status: 403 }
        );
      }
      return NextResponse.json({
        success: true,
        role: 'TECHNICIAN',
        redirectUrl: '/technician/dashboard',
      });
    }

    if (intendedRole === 'CUSTOMER') {
      if (actualRole === 'TECHNICIAN') {
        return NextResponse.json(
          { error: 'This account is registered as a technician. Please select Technician to sign in.' },
          { status: 403 }
        );
      }
      return NextResponse.json({
        success: true,
        role: 'CUSTOMER',
        redirectUrl: '/customer/dashboard',
      });
    }

    return NextResponse.json({
      success: true,
      role: actualRole,
      redirectUrl: '/customer/dashboard',
    });
  } catch (error: any) {
    console.error('[Verify Login Error]', error);
    return NextResponse.json(
      { error: 'Authentication verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
