// ============================================================
// Wristloom — Login Credential & Role Verification API
// Backend-enforced authority verifying intended role vs database role
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { loginLimiter } from '@/lib/rate-limit';

const verifySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  intendedRole: z.enum(['CUSTOMER', 'TECHNICIAN']).default('CUSTOMER'),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const limit = await loginLimiter.check(15, ip);
    if (!limit.success) {
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

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Dedicated admin email enforcement
    const isDedicatedAdmin = email === 'wristloom@gmail.com';
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
