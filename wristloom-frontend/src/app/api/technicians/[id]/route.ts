// ============================================================
// Wristloom — Single Technician API Route (Next.js)
// Handles GET and PATCH for technician availability and details
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

import { auth } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const tech = await db.technician.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, phone: true, profileImage: true } },
      },
    });

    if (!tech) {
      return NextResponse.json({ error: 'Technician not found' }, { status: 404 });
    }

    return NextResponse.json(tech);
  } catch (err: any) {
    console.error('[Technician GET Error]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to load technician' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const tech = await db.technician.findUnique({ where: { id } });
    if (!tech) {
      return NextResponse.json({ error: 'Technician not found' }, { status: 404 });
    }

    const isAdmin = session.user.role === 'ADMIN';
    const isSelf = tech.userId === session.user.id;

    if (!isAdmin && !isSelf) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { isAvailable, isVerified } = body;

    const data: Record<string, any> = {};
    if (typeof isAvailable === 'boolean') data.isAvailable = isAvailable;
    if (typeof isVerified === 'boolean') {
      if (!isAdmin) {
        return NextResponse.json({ error: 'Only admins can modify verification status' }, { status: 403 });
      }
      data.isVerified = isVerified;
    }

    const updated = await db.technician.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('[Technician PATCH Error]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to update technician' }, { status: 500 });
  }
}
