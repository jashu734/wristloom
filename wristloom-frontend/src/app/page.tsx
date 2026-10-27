import type { Metadata } from 'next';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { HeroSection } from '@/components/editorial/HeroSection';
import { FeaturedCollections } from '@/components/commerce/FeaturedCollections';
import { BrandShowcaseStrip } from '@/components/commerce/BrandShowcaseStrip';
import { ServiceEntryPoints } from '@/components/editorial/ServiceEntryPoints';
import { EcosystemSection } from '@/components/editorial/EcosystemSection';
import { FeaturedTechnicians } from '@/components/services/FeaturedTechnicians';
import { TestimonialsStrip } from '@/components/editorial/TestimonialsStrip';

import { db } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Wristloom — Crafted in Time',
  description:
    'The definitive digital ecosystem for luxury watch ownership. Discover, authenticate, maintain, and trade timepieces — all in one platform.',
};

export const revalidate = 60;

export default async function HomePage() {
  let initialBrands: any[] = [];
  try {
    const rawBrands = await db.brand.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    initialBrands = rawBrands.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      logo: b.logo,
      productCount: b._count.products,
    }));
  } catch (err) {
    console.error('Failed to prefetch brands for homepage:', err);
  }

  return (
    <SiteWrapper noHeaderPadding>
      {/* 1. Hero — full-bleed with thread motif */}
      <HeroSection />

      {/* 2. Featured Collections — editorial product showcase */}
      <FeaturedCollections />

      {/* 3. Authorized Watch Houses Showcase */}
      <BrandShowcaseStrip initialBrands={initialBrands} />

      {/* 4. Service Entry Points — the ecosystem differentiator */}
      <ServiceEntryPoints />

      {/* 4. The Ecosystem — lifecycle narrative */}
      <EcosystemSection />

      {/* 5. Featured Technicians strip */}
      <FeaturedTechnicians />

      {/* 6. Testimonials strip */}
      <TestimonialsStrip />
    </SiteWrapper>
  );
}
