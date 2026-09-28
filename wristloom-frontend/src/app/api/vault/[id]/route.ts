// ============================================================
// Wristloom — Single Watch Vault Item API Route (Next.js)
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

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
    const updated = await db.watchVaultItem.update({
      where: { id },
      data: body,
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
