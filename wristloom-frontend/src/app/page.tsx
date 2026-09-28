import type { Metadata } from 'next';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { HeroSection } from '@/components/editorial/HeroSection';
import { FeaturedCollections } from '@/components/commerce/FeaturedCollections';
import { ServiceEntryPoints } from '@/components/editorial/ServiceEntryPoints';
import { EcosystemSection } from '@/components/editorial/EcosystemSection';
import { FeaturedTechnicians } from '@/components/services/FeaturedTechnicians';
import { TestimonialsStrip } from '@/components/editorial/TestimonialsStrip';

export const metadata: Metadata = {
  title: 'Wristloom — Crafted in Time',
  description:
    'The definitive digital ecosystem for luxury watch ownership. Discover, authenticate, maintain, and trade timepieces — all in one platform.',
};

export default function HomePage() {
  return (
    <SiteWrapper noHeaderPadding>
      {/* 1. Hero — full-bleed with thread motif */}
      <HeroSection />

      {/* 2. Featured Collections — editorial product showcase */}
      <FeaturedCollections />

      {/* 3. Service Entry Points — the ecosystem differentiator */}
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
