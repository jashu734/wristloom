// ============================================================
// Wristloom — Single Technician API Route (Next.js)
// Handles GET and PATCH for technician availability and details
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
    const { id } = await context.params;
    const body = await req.json();
    const { isAvailable } = body;

    const data: Record<string, any> = {};
    if (typeof isAvailable === 'boolean') data.isAvailable = isAvailable;

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
