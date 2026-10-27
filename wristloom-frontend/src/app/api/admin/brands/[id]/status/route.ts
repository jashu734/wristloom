// ============================================================
// Wristloom — Admin Brand Status Toggle API Route
// PATCH: Activate or deactivate a brand (ADMIN ONLY)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { isUserAdmin } from '@/lib/roles';
import { z } from 'zod';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const statusSchema = z.object({
  isActive: z.boolean({ required_error: 'isActive boolean is required' }),
});

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
    if (!isUserAdmin(session.user)) {
      return NextResponse.json({ error: 'Forbidden: Administrator privileges required' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { isActive } = statusSchema.parse(body);

    const existing = await db.brand.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    const updated = await db.brand.update({
      where: { id: existing.id },
      data: { isActive },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json({
      message: `Brand "${updated.name}" is now ${isActive ? 'active' : 'inactive'}`,
      brand: {
        ...updated,
        productCount: updated._count.products,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Validation error' },
        { status: 422 }
      );
    }
    console.error('[Admin Brand Status PATCH Error]', error);
    return NextResponse.json(
      { error: error.message ?? 'Failed to update brand status' },
      { status: 500 }
    );
  }
}
