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
    [orderStatsRaw],
    [bookingStatsRaw],
    recentOrders,
    lowStockProducts,
    recentBookings,
  ]: any = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: 'CUSTOMER' } }),
    db.technician.count(),
    db.product.count(),

    // Consolidated Order statistics and revenue windows in 1 SQL query
    db.$queryRaw`
      SELECT
        COUNT(*)::int as total_orders,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END)::int as pending_orders,
        COALESCE(SUM(CASE WHEN payment_status IN ('FULLY_PAID', 'DEPOSIT_PAID') THEN total_amount ELSE 0 END), 0)::float as order_revenue_sum,
        COALESCE(SUM(CASE WHEN created_at >= ${startOfToday} AND payment_status IN ('FULLY_PAID', 'DEPOSIT_PAID') THEN total_amount ELSE 0 END), 0)::float as today_order_rev,
        COALESCE(SUM(CASE WHEN created_at >= ${startOf7DaysAgo} AND payment_status IN ('FULLY_PAID', 'DEPOSIT_PAID') THEN total_amount ELSE 0 END), 0)::float as week_order_rev,
        COALESCE(SUM(CASE WHEN created_at >= ${startOf30DaysAgo} AND payment_status IN ('FULLY_PAID', 'DEPOSIT_PAID') THEN total_amount ELSE 0 END), 0)::float as month_order_rev,
        COALESCE(SUM(CASE WHEN created_at >= ${startOfYear} AND payment_status IN ('FULLY_PAID', 'DEPOSIT_PAID') THEN total_amount ELSE 0 END), 0)::float as year_order_rev
      FROM orders;
    `,

    // Consolidated Service booking statistics and revenue windows in 1 SQL query
    db.$queryRaw`
      SELECT
        COUNT(*)::int as total_bookings,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END)::int as pending_bookings,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END)::int as completed_services,
        COALESCE(SUM(CASE WHEN "paymentStatus" IN ('DEPOSIT_PAID', 'FULLY_PAID') THEN "depositAmount" ELSE 0 END), 0)::float as service_revenue_sum,
        COALESCE(SUM(CASE WHEN "createdAt" >= ${startOfToday} AND "paymentStatus" IN ('DEPOSIT_PAID', 'FULLY_PAID') THEN "depositAmount" ELSE 0 END), 0)::float as today_service_rev,
        COALESCE(SUM(CASE WHEN "createdAt" >= ${startOf7DaysAgo} AND "paymentStatus" IN ('DEPOSIT_PAID', 'FULLY_PAID') THEN "depositAmount" ELSE 0 END), 0)::float as week_service_rev,
        COALESCE(SUM(CASE WHEN "createdAt" >= ${startOf30DaysAgo} AND "paymentStatus" IN ('DEPOSIT_PAID', 'FULLY_PAID') THEN "depositAmount" ELSE 0 END), 0)::float as month_service_rev,
        COALESCE(SUM(CASE WHEN "createdAt" >= ${startOfYear} AND "paymentStatus" IN ('DEPOSIT_PAID', 'FULLY_PAID') THEN "depositAmount" ELSE 0 END), 0)::float as year_service_rev
      FROM repair_bookings;
    `,

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

  const totalOrders = orderStatsRaw?.total_orders ?? 0;
  const pendingOrders = orderStatsRaw?.pending_orders ?? 0;
  const totalBookings = bookingStatsRaw?.total_bookings ?? 0;
  const pendingBookings = bookingStatsRaw?.pending_bookings ?? 0;
  const completedServices = bookingStatsRaw?.completed_services ?? 0;

  const totalRevenue = (orderStatsRaw?.order_revenue_sum ?? 0) + (bookingStatsRaw?.service_revenue_sum ?? 0);
  const todayRevenue = (orderStatsRaw?.today_order_rev ?? 0) + (bookingStatsRaw?.today_service_rev ?? 0);
  const weekRevenue = (orderStatsRaw?.week_order_rev ?? 0) + (bookingStatsRaw?.week_service_rev ?? 0);
  const monthRevenue = (orderStatsRaw?.month_order_rev ?? 0) + (bookingStatsRaw?.month_service_rev ?? 0);
  const yearRevenue = (orderStatsRaw?.year_order_rev ?? 0) + (bookingStatsRaw?.year_service_rev ?? 0);

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
