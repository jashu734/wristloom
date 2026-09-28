import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { AdminTechniciansClient } from '@/components/admin/AdminTechniciansClient';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Technician Management',
  description: 'Manage master watchmakers, atelier certifications, and active service job allocations',
};

export const dynamic = 'force-dynamic';

export default async function AdminTechniciansPage() {
  const technicians = await db.technician.findMany({
    include: {
      user: { select: { name: true, email: true, phone: true, profileImage: true } },
      bookings: { select: { id: true, status: true } },
    },
    orderBy: { rating: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(176,141,87,0.15)]">
        <div>
          <span className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] block mb-1">
            Atelier Horologists
          </span>
          <h1 className="font-display text-2xl sm:text-3xl text-[#EDE6D6]">Master Technician Roster</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-[#B08D57] bg-[rgba(176,141,87,0.10)] border border-[rgba(176,141,87,0.20)] px-3 py-1.5 rounded-[1px]">
            {technicians.length} Certified Horologists
          </span>
          <Link
            href="/admin/technicians/add"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#B08D57] text-[#14110F] text-xs font-mono tracking-wider uppercase font-semibold rounded-[2px] hover:bg-[#c29f68] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Technician</span>
          </Link>
        </div>
      </div>

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
  );
}
