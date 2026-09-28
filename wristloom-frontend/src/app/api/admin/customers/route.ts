// ============================================================
// Wristloom — Admin Customers API Route
// Lists all registered customers with purchase metrics and activity counts
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q');

    const where: any = { role: 'CUSTOMER' };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const customers = await db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        createdAt: true,
        creditWallet: { select: { balance: true } },
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            paymentStatus: true,
          },
        },
        bookingsAsCustomer: {
          select: {
            id: true,
            status: true,
          },
        },
        addresses: {
          take: 1,
          select: {
            city: true,
            country: true,
            formattedAddress: true,
          },
        },
      },
    });

    const formatted = customers.map((c) => {
      const totalSpent = c.orders
        .filter((o) => o.paymentStatus === 'FULLY_PAID' || o.paymentStatus === 'DEPOSIT_PAID')
        .reduce((acc, curr) => acc + curr.totalAmount, 0);

      return {
        id: c.id,
        name: c.name || 'Unnamed Client',
        email: c.email,
        phone: c.phone || '—',
        profileImage: c.profileImage,
        joinedDate: c.createdAt,
        ordersCount: c.orders.length,
        totalSpent,
        bookingsCount: c.bookingsAsCustomer.length,
        walletBalance: c.creditWallet?.balance ?? 0,
        city: c.addresses[0]?.city || '—',
      };
    });

    return NextResponse.json({ customers: formatted, total: formatted.length });
  } catch (error: any) {
    console.error('[Admin Customers GET Error]', error);
    return NextResponse.json({ error: error.message ?? 'Failed to fetch customers' }, { status: 500 });
  }
}
