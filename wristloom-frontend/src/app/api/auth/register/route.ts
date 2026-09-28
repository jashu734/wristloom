// ============================================================
// Wristloom — Registration API Route (Next.js)
// Creates user in DB via Prisma, then returns success
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

import { registerLimiter } from '@/lib/rate-limit';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const limit = await registerLimiter.check(5, ip);
    if (!limit.success) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const data = registerSchema.parse(body);

    // Check if email already exists
    const existing = await db.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    // Hash password & create user
    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        phone: data.phone,
        role: 'CUSTOMER',
        creditWallet: { create: { balance: 0 } },
      },
    });

    return NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email, role: user.role } },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message ?? 'Validation failed' }, { status: 400 });
    }
    console.error('[Register Error]', err);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
