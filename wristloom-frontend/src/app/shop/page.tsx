import type { Metadata } from 'next';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { ShopGrid } from '@/components/commerce/ShopGrid';

export const metadata: Metadata = {
  title: 'Explore Watches',
  description: 'Browse Wristloom\'s curated selection of new and certified pre-owned luxury timepieces from the world\'s finest watchmakers.',
};

export default function ShopPage() {
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
      <ShopGrid />
    </SiteWrapper>
  );
}
