// ============================================================
// Wristloom — Watch Vault API Route (Next.js)
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

const vaultItemSchema = z.object({
  watchName: z.string().min(1, 'Watch name is required'),
  brand: z.string().min(1, 'Brand is required'),
  referenceNumber: z.string().optional(),
  movement: z.string().optional(),
  caseSize: z.string().optional(),
  dialColor: z.string().optional(),
  strapMaterial: z.string().optional(),
  serialNumber: z.string().optional(),
  yearOfManufacture: z.number().optional(),
  purchasePrice: z.number().optional(),
  notes: z.string().optional(),
  photoUrls: z.array(z.string()).optional().default([]),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const watches = await db.watchVaultItem.findMany({
      where: { ownerId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(watches);
  } catch (err: any) {
    console.error('[Vault GET Error]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to load vault items' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = vaultItemSchema.parse(body);

    const watch = await db.watchVaultItem.create({
      data: {
        ownerId: session.user.id,
        ...data,
      },
    });

    return NextResponse.json(watch, { status: 201 });
  } catch (err: any) {
    console.error('[Vault POST Error]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to create vault item' }, { status: 400 });
  }
}
