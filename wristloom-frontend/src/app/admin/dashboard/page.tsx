// ============================================================
// Wristloom — Admin Dashboard Page
// Overview of platform revenue, orders, customers, and active services
// ============================================================

import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';

export const metadata: Metadata = {
  title: 'Executive Dashboard',
  description: 'Wristloom platform executive control centre and financial overview',
};

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOf7DaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOf30DaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    totalUsers,
    totalCustomers,
    totalTechnicians,
    totalProducts,
    totalOrders,
    pendingOrders,
    totalBookings,
    pendingBookings,
    completedServices,
    orderRevenueSum,
    serviceRevenueSum,
    todayOrderRev,
    weekOrderRev,
    monthOrderRev,
    yearOrderRev,
    todayServiceRev,
    weekServiceRev,
    monthServiceRev,
    yearServiceRev,
    recentOrders,
    lowStockProducts,
    recentBookings,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: 'CUSTOMER' } }),
    db.technician.count(),
    db.product.count(),
    db.order.count(),
    db.order.count({ where: { status: 'PENDING' } }),
    db.repairBooking.count(),
    db.repairBooking.count({ where: { status: 'PENDING' } }),
    db.repairBooking.count({ where: { status: 'COMPLETED' } }),

    // All time revenue
    db.order.aggregate({
      where: { paymentStatus: { in: ['FULLY_PAID', 'DEPOSIT_PAID'] } },
      _sum: { totalAmount: true },
    }),
    db.repairBooking.aggregate({
      where: { paymentStatus: { in: ['DEPOSIT_PAID', 'FULLY_PAID'] } },
      _sum: { depositAmount: true },
    }),

    // Orders revenue by time windows
    db.order.aggregate({
      where: { createdAt: { gte: startOfToday }, paymentStatus: { in: ['FULLY_PAID', 'DEPOSIT_PAID'] } },
      _sum: { totalAmount: true },
    }),
    db.order.aggregate({
      where: { createdAt: { gte: startOf7DaysAgo }, paymentStatus: { in: ['FULLY_PAID', 'DEPOSIT_PAID'] } },
      _sum: { totalAmount: true },
    }),
    db.order.aggregate({
      where: { createdAt: { gte: startOf30DaysAgo }, paymentStatus: { in: ['FULLY_PAID', 'DEPOSIT_PAID'] } },
      _sum: { totalAmount: true },
    }),
    db.order.aggregate({
      where: { createdAt: { gte: startOfYear }, paymentStatus: { in: ['FULLY_PAID', 'DEPOSIT_PAID'] } },
      _sum: { totalAmount: true },
    }),

    // Service revenue by time windows
    db.repairBooking.aggregate({
      where: { createdAt: { gte: startOfToday }, paymentStatus: { in: ['DEPOSIT_PAID', 'FULLY_PAID'] } },
      _sum: { depositAmount: true },
    }),
    db.repairBooking.aggregate({
      where: { createdAt: { gte: startOf7DaysAgo }, paymentStatus: { in: ['DEPOSIT_PAID', 'FULLY_PAID'] } },
      _sum: { depositAmount: true },
    }),
    db.repairBooking.aggregate({
      where: { createdAt: { gte: startOf30DaysAgo }, paymentStatus: { in: ['DEPOSIT_PAID', 'FULLY_PAID'] } },
      _sum: { depositAmount: true },
    }),
    db.repairBooking.aggregate({
      where: { createdAt: { gte: startOfYear }, paymentStatus: { in: ['DEPOSIT_PAID', 'FULLY_PAID'] } },
      _sum: { depositAmount: true },
    }),

    // Recent Orders
    db.order.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        orderItems: { select: { id: true, name: true, brand: true, quantity: true, price: true } },
      },
    }),

    // Low stock products (stock <= 3)
    db.product.findMany({
      where: { stockCount: { lte: 3 } },
      orderBy: { stockCount: 'asc' },
      take: 6,
      select: {
        id: true,
        slug: true,
        name: true,
        brand: true,
        price: true,
        stockCount: true,
        inStock: true,
        images: true,
      },
    }),

    // Recent Bookings
    db.repairBooking.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true, email: true } },
        technician: { include: { user: { select: { name: true } } } },
      },
    }),
  ]);

  const totalRevenue = (orderRevenueSum._sum?.totalAmount || 0) + (serviceRevenueSum._sum?.depositAmount || 0);
  const todayRevenue = (todayOrderRev._sum?.totalAmount || 0) + (todayServiceRev._sum?.depositAmount || 0);
  const weekRevenue = (weekOrderRev._sum?.totalAmount || 0) + (weekServiceRev._sum?.depositAmount || 0);
  const monthRevenue = (monthOrderRev._sum?.totalAmount || 0) + (monthServiceRev._sum?.depositAmount || 0);
  const yearRevenue = (yearOrderRev._sum?.totalAmount || 0) + (yearServiceRev._sum?.depositAmount || 0);

  const chartTimeline = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const label = dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    chartTimeline.push({
      date: label,
      dayTimestamp: dayStart.toISOString(),
    });
  }

  const initialData = {
    summary: {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalTechnicians,
      pendingOrders,
      pendingBookings,
      completedServices,
      totalProducts,
      totalUsers,
    },
    revenueBreakdown: {
      today: todayRevenue,
      week: weekRevenue,
      month: monthRevenue,
      year: yearRevenue,
      allTime: totalRevenue,
    },
    chartTimeline,
    recentOrders,
    lowStockProducts,
    recentBookings,
  };

  return <AdminDashboardClient initialData={initialData} />;
}
