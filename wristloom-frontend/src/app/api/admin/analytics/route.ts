// ============================================================
// Wristloom — Admin Analytics API Route
// Aggregates platform sales, service performance, brand distribution
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

    const now = new Date();

    // 1. Order status counts
    const ordersByStatus = await db.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // 2. Service booking status counts
    const bookingsByStatus = await db.repairBooking.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // 3. Products by brand distribution
    const productsByBrand = await db.product.groupBy({
      by: ['brand'],
      _count: { id: true },
      _sum: { stockCount: true },
    });

    // 4. Technician performance ranking
    const technicianRankings = await db.technician.findMany({
      orderBy: [{ completedServices: 'desc' }, { rating: 'desc' }],
      take: 8,
      include: {
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    // 5. Monthly trends for the last 6 months
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const year = now.getFullYear();
      const month = now.getMonth() - i;
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
      const label = startOfMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      const [ordersSum, ordersCount, bookingsCount] = await Promise.all([
        db.order.aggregate({
          where: {
            createdAt: { gte: startOfMonth, lte: endOfMonth },
            paymentStatus: { in: ['FULLY_PAID', 'DEPOSIT_PAID'] },
          },
          _sum: { totalAmount: true },
        }),
        db.order.count({
          where: { createdAt: { gte: startOfMonth, lte: endOfMonth } },
        }),
        db.repairBooking.count({
          where: { createdAt: { gte: startOfMonth, lte: endOfMonth } },
        }),
      ]);

      monthlyTrends.push({
        month: label,
        revenue: ordersSum._sum?.totalAmount || 0,
        orders: ordersCount,
        services: bookingsCount,
      });
    }

    return NextResponse.json({
      ordersByStatus,
      bookingsByStatus,
      productsByBrand,
      technicianRankings,
      monthlyTrends,
    });
  } catch (error: any) {
    console.error('[Admin Analytics GET Error]', error);
    return NextResponse.json({ error: error.message ?? 'Failed to load analytics' }, { status: 500 });
  }
}
