'use client';

import * as React from 'react';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  ShoppingBag,
  Wrench,
  Watch,
  Star,
  DollarSign,
  ArrowUpRight,
} from 'lucide-react';

interface AnalyticsData {
  ordersByStatus: Array<{ status: string; _count: { id: number } }>;
  bookingsByStatus: Array<{ status: string; _count: { id: number } }>;
  productsByBrand: Array<{ brand: string; _count: { id: number }; _sum: { stockCount: number | null } }>;
  technicianRankings: Array<any>;
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    orders: number;
    services: number;
  }>;
}

export function AdminAnalyticsClient({ data }: { data: AnalyticsData }) {
  const maxRevenue = Math.max(...data.monthlyTrends.map((t) => t.revenue), 1000);

  const totalOrders = data.ordersByStatus.reduce((acc, curr) => acc + curr._count.id, 0);
  const totalBookings = data.bookingsByStatus.reduce((acc, curr) => acc + curr._count.id, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(176,141,87,0.15)]">
        <div>
          <span className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] block mb-1">
            Intelligence & Trends
          </span>
          <h1 className="font-display text-2xl sm:text-3xl text-[#EDE6D6]">Platform Analytics</h1>
        </div>
        <span className="font-mono text-xs text-[rgba(237,230,214,0.40)]">
          Real-time PostgreSQL telemetry
        </span>
      </div>

      {/* 6-Month Monthly Revenue & Volume Trajectory */}
      <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(176,141,87,0.10)]">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#B08D57]" />
            <h2 className="font-display text-lg text-[#EDE6D6]">6-Month Revenue & Activity Growth</h2>
          </div>
          <span className="font-mono text-xs text-[#B08D57]">INR (₹)</span>
        </div>

        {/* Bar & Trend Chart */}
        <div className="h-60 w-full bg-[#14110F] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 flex items-end justify-between gap-4">
          {data.monthlyTrends.map((m) => {
            const heightPercent = Math.max(12, Math.round((m.revenue / maxRevenue) * 85));
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="text-[10px] font-mono text-[#B08D57] opacity-0 group-hover:opacity-100 transition-opacity">
                  ₹{(m.revenue / 1000).toFixed(0)}k
                </div>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[48px] bg-gradient-to-t from-[rgba(176,141,87,0.25)] to-[#B08D57] rounded-t-[1px] group-hover:to-[#EDE6D6] transition-all relative"
                />
                <span className="font-mono text-[10px] text-[rgba(237,230,214,0.50)] tracking-wider">
                  {m.month}
                </span>
                <span className="font-mono text-[9px] text-[rgba(237,230,214,0.30)]">
                  {m.orders} ord / {m.services} srv
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Order Status & Service Status Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Status */}
        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[rgba(176,141,87,0.10)]">
            <ShoppingBag className="w-4 h-4 text-[#B08D57]" />
            <h3 className="font-display text-base text-[#EDE6D6]">Order Status Distribution ({totalOrders})</h3>
          </div>

          <div className="space-y-3">
            {data.ordersByStatus.map((s) => {
              const pct = totalOrders > 0 ? Math.round((s._count.id / totalOrders) * 100) : 0;
              return (
                <div key={s.status} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[rgba(237,230,214,0.80)]">{s.status}</span>
                    <span className="text-[#B08D57]">{s._count.id} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-[#14110F] rounded-[1px] overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-gradient-to-r from-[rgba(176,141,87,0.40)] to-[#B08D57]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Service Bookings Status */}
        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[rgba(176,141,87,0.10)]">
            <Wrench className="w-4 h-4 text-[#B08D57]" />
            <h3 className="font-display text-base text-[#EDE6D6]">Service Workflow Breakdown ({totalBookings})</h3>
          </div>

          <div className="space-y-3">
            {data.bookingsByStatus.map((s) => {
              const pct = totalBookings > 0 ? Math.round((s._count.id / totalBookings) * 100) : 0;
              return (
                <div key={s.status} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[rgba(237,230,214,0.80)]">{s.status}</span>
                    <span className="text-[#B08D57]">{s._count.id} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-[#14110F] rounded-[1px] overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-gradient-to-r from-emerald-800 to-emerald-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid: Watch Brand Share & Horologist Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Watch Brands in Atelier */}
        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[rgba(176,141,87,0.10)]">
            <Watch className="w-4 h-4 text-[#B08D57]" />
            <h3 className="font-display text-base text-[#EDE6D6]">Catalog Maison Distribution</h3>
          </div>

          <div className="divide-y divide-[rgba(176,141,87,0.08)]">
            {data.productsByBrand.map((b) => (
              <div key={b.brand} className="py-2.5 flex items-center justify-between text-xs font-mono">
                <span className="text-[#EDE6D6] font-medium">{b.brand}</span>
                <div className="flex items-center gap-4 text-[rgba(237,230,214,0.50)]">
                  <span>{b._count.id} Models</span>
                  <span className="text-[#B08D57]">{b._sum.stockCount ?? 0} in Vault</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technician League Table */}
        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[rgba(176,141,87,0.10)]">
            <Star className="w-4 h-4 text-[#B08D57]" />
            <h3 className="font-display text-base text-[#EDE6D6]">Horologist Performance League</h3>
          </div>

          <div className="divide-y divide-[rgba(176,141,87,0.08)]">
            {data.technicianRankings.map((t, idx) => (
              <div key={t.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] text-[10px] font-mono flex items-center justify-center text-[#B08D57]">
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="font-medium text-[#EDE6D6]">{t.user?.name}</p>
                    <p className="font-mono text-[10px] text-[rgba(237,230,214,0.40)]">
                      {t.yearsExperience} yrs • {t.completedServices} services
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 font-mono text-[#B08D57]">
                  <Star className="w-3.5 h-3.5 fill-[#B08D57]" />
                  <span>{t.rating.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
