// ============================================================
// Wristloom — Registration API Route (Next.js)
// Creates user in DB via Prisma with validation & rate-limiting
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { registerLimiter } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/http';
import { isAdminEmail } from '@/lib/roles';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().trim().email('Valid email is required').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long'),
  phone: z.string().trim().max(32).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limit = await registerLimiter.check(5, ip);
    if (!limit.success) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const data = registerSchema.parse(body);
    const normalizedEmail = data.email.toLowerCase().trim();

    // Disallow public registration for any configured admin email
    if (isAdminEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: 'This email is reserved for system administration and cannot be registered publicly.' },
        { status: 403 }
      );
    }

    // Check if email already exists
    const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    // Hash password & create user
    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await db.user.create({
      data: {
        name: data.name,
        email: normalizedEmail,
        passwordHash,
        phone: data.phone ?? null,
        role: 'CUSTOMER',
        creditWallet: { create: { balance: 0 } },
      },
    });

    return NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email, role: user.role } },
      { status: 201 }
    );
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message ?? 'Validation failed' }, { status: 400 });
    }
    console.error('[Register Error]', err);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
