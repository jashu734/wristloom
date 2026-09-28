import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Link from 'next/link';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { AdminTechniciansClient } from '@/components/admin/AdminTechniciansClient';

export const metadata: Metadata = { title: 'Admin — Technician Roster' };

export default async function AdminTechniciansPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/account');

  const technicians = await db.technician.findMany({
    include: {
      user: { select: { name: true, email: true, phone: true, profileImage: true } },
      bookings: { select: { id: true, status: true } },
    },
    orderBy: { rating: 'desc' },
  });

  return (
    <SiteWrapper>
      <div className="min-h-screen bg-[#14110F]">
        <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
          <div className="container-wl py-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href="/admin" className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] hover:text-[#B08D57]">
                  ← Control Centre
                </Link>
              </div>
              <h1 className="font-display text-3xl text-[#EDE6D6]">Technician Roster</h1>
            </div>
            <span className="font-mono text-sm text-[#B08D57] bg-[rgba(176,141,87,0.10)] border border-[rgba(176,141,87,0.20)] px-3 py-1 rounded-[1px]">
              {technicians.length} Master Watchmakers
            </span>
          </div>
        </div>

        <div className="container-wl py-8">
          <AdminTechniciansClient
            initialTechnicians={technicians.map((t: any) => ({
              id: t.id,
              user: t.user,
              specializations: t.specializations,
              yearsExperience: t.yearsExperience,
              completedServices: t.completedServices,
              rating: t.rating,
              isAvailable: t.isAvailable,
              isVerified: t.isVerified,
              activeJobs: t.bookings.filter((b: any) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED').length,
            }))}
          />
        </div>
      </div>
    </SiteWrapper>
  );
}
