// ============================================================
// Wristloom — Single Watch Vault Item API Route (Next.js)
// Validated PATCH preventing mass assignment & ownership checks
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const updateVaultItemSchema = z.object({
  watchName: z.string().trim().min(1).max(200).optional(),
  brand: z.string().trim().min(1).max(100).optional(),
  referenceNumber: z.string().trim().max(100).optional().nullable(),
  movement: z.string().trim().max(100).optional().nullable(),
  caseSize: z.string().trim().max(50).optional().nullable(),
  dialColor: z.string().trim().max(50).optional().nullable(),
  strapMaterial: z.string().trim().max(100).optional().nullable(),
  serialNumber: z.string().trim().max(100).optional().nullable(),
  yearOfManufacture: z.number().int().min(1800).max(2100).optional().nullable(),
  purchaseDate: z.string().transform((str) => new Date(str)).optional().nullable(),
  purchasePrice: z.number().min(0).optional().nullable(),
  lastServiceDate: z.string().transform((str) => new Date(str)).optional().nullable(),
  serviceDueDate: z.string().transform((str) => new Date(str)).optional().nullable(),
  healthStatus: z.string().trim().max(50).optional(),
  notes: z.string().max(2000).optional().nullable(),
  photoUrls: z.array(z.string().max(2048)).optional(),
  documentUrls: z.array(z.string().max(2048)).optional(),
});

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const watch = await db.watchVaultItem.findUnique({ where: { id } });

    if (!watch || watch.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateVaultItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid update data' },
        { status: 400 }
      );
    }

    const updated = await db.watchVaultItem.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('[Vault PATCH Error]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to update vault item' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const watch = await db.watchVaultItem.findUnique({ where: { id } });

    if (!watch || watch.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await db.watchVaultItem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Vault DELETE Error]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to delete vault item' }, { status: 500 });
  }
}
