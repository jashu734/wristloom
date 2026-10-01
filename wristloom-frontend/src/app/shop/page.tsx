import type { Metadata } from 'next';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { ShopGrid } from '@/components/commerce/ShopGrid';
import { db } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Explore Watches',
  description: 'Browse Wristloom\'s curated selection of new and certified pre-owned luxury timepieces from the world\'s finest watchmakers.',
};

export const revalidate = 60;

export default async function ShopPage() {
  let initialProducts: any[] = [];
  try {
    const rawProducts = await db.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    initialProducts = rawProducts.map((p) => {
      const purchaseVal = p.purchaseValue ?? p.price;
      const primaryImage = p.imageUrl || (p.images && p.images.length > 0 ? p.images[0] : '/watches/placeholder-watch.svg');
      return {
        ...p,
        modelName: p.modelName || p.name,
        purchaseValue: purchaseVal,
        price: purchaseVal,
        imageUrl: primaryImage,
        images: p.images && p.images.length > 0 ? p.images : [primaryImage],
        stock: p.stock ?? p.stockCount ?? 5,
      };
    });
  } catch (err) {
    console.error('Failed to prefetch shop products:', err);
  }

  return (
    <SiteWrapper>
      {/* Page header */}
      <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
        <div className="container-wl py-12">
          <span className="text-overline block mb-3">The Collection</span>
          <h1 className="font-display text-4xl md:text-5xl text-[#EDE6D6] tracking-tight">
            Explore Watches
          </h1>
        </div>
      </div>
      <ShopGrid initialProducts={initialProducts} />
    </SiteWrapper>
  );
}
