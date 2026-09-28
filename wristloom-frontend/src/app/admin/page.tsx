import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Link from 'next/link';
import { SiteWrapper } from '@/components/layout/SiteWrapper';

export const metadata: Metadata = { title: 'Admin Dashboard' };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/account');

  const [
    totalUsers,
    totalBookings,
    pendingBookings,
    activeTechnicians,
    totalRevenue,
    totalProducts,
    totalOrders,
    totalOrderRevenue,
  ] = await Promise.all([
    db.user.count(),
    db.repairBooking.count(),
    db.repairBooking.count({ where: { status: 'PENDING' } }),
    db.technician.count({ where: { isVerified: true, isAvailable: true } }),
    db.repairBooking.aggregate({ where: { paymentStatus: { in: ['DEPOSIT_PAID', 'FULLY_PAID'] } }, _sum: { depositAmount: true } }),
    db.product.count(),
    db.order.count(),
    db.order.aggregate({ _sum: { totalAmount: true } }),
  ]);

  const recentBookings = await db.repairBooking.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { name: true, email: true } },
      technician: { include: { user: { select: { name: true } } } },
    },
  });

  const serviceRevenue = totalRevenue._sum.depositAmount ?? 0;
  const watchSalesRevenue = totalOrderRevenue._sum.totalAmount ?? 0;
  const combinedRevenue = serviceRevenue + watchSalesRevenue;

  return (
    <SiteWrapper>
      <div className="min-h-screen bg-[#14110F]">
        <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
          <div className="container-wl py-6">
            <span className="text-overline block mb-1">Administrator</span>
            <h1 className="font-display text-3xl text-[#EDE6D6]">Control Centre</h1>
          </div>
        </div>

        <div className="container-wl py-10 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { label: 'Total Users', value: totalUsers.toLocaleString() },
              { label: 'Catalog Watches', value: totalProducts.toLocaleString() },
              { label: 'Watch Orders', value: totalOrders.toLocaleString() },
              { label: 'Repair Bookings', value: totalBookings.toLocaleString() },
              { label: 'Pending Repairs', value: pendingBookings.toLocaleString(), highlight: pendingBookings > 0 },
              { label: 'Gross Revenue', value: `₹${(combinedRevenue / 100000).toFixed(1)}L` },
            ].map((s: { label: string; value: string; highlight?: boolean }) => (
              <div key={s.label} className={`bg-[#1E1A17] border rounded-[2px] p-4 ${s.highlight ? 'border-amber-700/50' : 'border-[rgba(176,141,87,0.10)]'}`}>
                <p className={`font-mono text-xl ${s.highlight ? 'text-amber-400' : 'text-[#B08D57]'}`}>{s.value}</p>
                <p className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Quick nav */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Bookings', href: '/admin/bookings' },
              { label: 'Watch Catalog', href: '/admin/products' },
              { label: 'Orders & Sales', href: '/admin/orders' },
              { label: 'Technicians', href: '/admin/technicians' },
              { label: 'Live Map Radar', href: '/admin/map' },
            ].map((l) => (
              <Link key={l.href} href={l.href}
                className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] hover:border-[rgba(176,141,87,0.30)] rounded-[2px] p-4 text-sm text-[rgba(237,230,214,0.65)] hover:text-[#EDE6D6] transition-all font-mono text-[10px] tracking-widest uppercase text-center">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Recent bookings */}
          <div>
            <h2 className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] mb-4">Recent Bookings</h2>
            <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(176,141,87,0.08)]">
                    {['Reference', 'Customer', 'Service', 'Status', 'Technician'].map((h) => (
                      <th key={h} className="text-left font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.30)] px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr key={b.id} className="border-b border-[rgba(176,141,87,0.05)] hover:bg-[rgba(176,141,87,0.04)] transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-[#B08D57]">{b.bookingReference}</td>
                      <td className="px-4 py-3 text-[rgba(237,230,214,0.70)]">{b.customer.name}</td>
                      <td className="px-4 py-3 text-[rgba(237,230,214,0.60)] text-xs">{b.serviceType}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-[rgba(237,230,214,0.45)]">
                          {b.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[rgba(237,230,214,0.50)] text-xs">
                        {b.technician?.user.name ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </SiteWrapper>
  );
}
