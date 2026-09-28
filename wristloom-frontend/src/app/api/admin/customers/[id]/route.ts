// ============================================================
// Wristloom — Single Customer Detail API Route
// Full customer profile, order history, repair bookings, vault items
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = await context.params;

    const customer = await db.user.findUnique({
      where: { id },
      include: {
        addresses: true,
        creditWallet: {
          include: {
            transactions: {
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            orderItems: true,
          },
        },
        bookingsAsCustomer: {
          orderBy: { createdAt: 'desc' },
          include: {
            technician: {
              include: {
                user: { select: { name: true, phone: true } },
              },
            },
          },
        },
        watchVaultItems: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ customer });
  } catch (error: any) {
    console.error('[Admin Customer Detail GET Error]', error);
    return NextResponse.json({ error: error.message ?? 'Failed to load customer profile' }, { status: 500 });
  }
}
