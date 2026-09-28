import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { AdminAnalyticsClient } from '@/components/admin/AdminAnalyticsClient';

export const metadata: Metadata = {
  title: 'Executive Analytics',
  description: 'Multi-dimensional platform analytics, revenue trends, and operational metrics',
};

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
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
    const label = startOfMonth.toLocaleDateString('en-US', { month: 'short' });

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

  const data = {
    ordersByStatus,
    bookingsByStatus,
    productsByBrand,
    technicianRankings,
    monthlyTrends,
  };

  return <AdminAnalyticsClient data={data} />;
}
