import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import Link from 'next/link';
import { AdminProductsClient } from '@/components/admin/AdminProductsClient';

export const metadata: Metadata = { title: 'Admin — Product Management' };

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/account');

  const products = await db.product.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <SiteWrapper>
      <div className="min-h-screen bg-[#14110F]">
        <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
          <div className="container-wl py-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href="/admin" className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] hover:text-[#B08D57]">
                  ← Control Centre
                </Link>
              </div>
              <h1 className="font-display text-3xl text-[#EDE6D6]">Watch Catalog & Inventory</h1>
            </div>
            <span className="font-mono text-sm text-[#B08D57] bg-[rgba(176,141,87,0.10)] border border-[rgba(176,141,87,0.20)] px-3 py-1 rounded-[1px]">
              {products.length} Timepieces in Atelier
            </span>
          </div>
        </div>

        <div className="container-wl py-8">
          <AdminProductsClient initialProducts={products} />
        </div>
      </div>
    </SiteWrapper>
  );
}
