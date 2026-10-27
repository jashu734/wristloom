import * as React from 'react';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import Link from 'next/link';
import { Award, ArrowRight, ExternalLink, Watch, Sparkles } from 'lucide-react';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Watch Houses & Manufacture Directory | Wristloom',
  description: 'Explore the storied manufactures, master horologists, and luxury timepiece brands curated by Wristloom.',
};

export default async function BrandsDirectoryPage() {
  const brands = await db.brand.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: {
          products: {
            where: { isActive: true },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <SiteWrapper>
      <div className="min-h-screen bg-[#14110F]">
        {/* Header Hero */}
        <section className="border-b border-[rgba(176,141,87,0.12)] bg-[#171412] py-16 md:py-24">
          <div className="container-wl">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-px bg-[#B08D57]" />
              <span className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57]">
                Haute Horlogerie Portfolio
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-5xl text-[#EDE6D6] tracking-tight mb-4">
              Authorized Watch Houses
            </h1>
            <p className="text-sm md:text-base text-[rgba(237,230,214,0.60)] max-w-2xl leading-relaxed">
              Every timepiece in the Wristloom atelier is certified authentic, inspected by master watchmakers, and backed by comprehensive transit insurance. Explore our curated partner manufactures.
            </p>
          </div>
        </section>

        {/* Brands Directory Grid */}
        <section className="container-wl py-12 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand) => {
              const productCount = brand._count.products;
              return (
                <div
                  key={brand.id}
                  className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 flex flex-col justify-between hover:border-[#B08D57]/50 transition-all group"
                >
                  <div>
                    {/* Brand Emblem & Name */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="w-14 h-14 rounded-[2px] bg-[#14110F] border border-[rgba(176,141,87,0.20)] p-1.5 flex items-center justify-center shrink-0">
                        {brand.logo ? (
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="font-display text-lg font-semibold text-[#B08D57]">
                            {brand.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {brand.websiteUrl && (
                          <a
                            href={brand.websiteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-[2px] border border-[rgba(176,141,87,0.15)] text-[rgba(237,230,214,0.40)] hover:text-[#B08D57] hover:border-[#B08D57] transition-colors"
                            title={`Official ${brand.name} Website`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-[2px] bg-[#14110F] border border-[rgba(176,141,87,0.15)] text-[#B08D57]">
                          {productCount} {productCount === 1 ? 'Watch' : 'Watches'}
                        </span>
                      </div>
                    </div>

                    <h2 className="font-display text-xl text-[#EDE6D6] mb-2 group-hover:text-[#B08D57] transition-colors">
                      {brand.name}
                    </h2>

                    <p className="text-xs text-[rgba(237,230,214,0.55)] leading-relaxed mb-6 line-clamp-3">
                      {brand.description ||
                        'Certified authentic luxury horology certified and authenticated by Wristloom master watchmakers.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[rgba(176,141,87,0.08)]">
                    <Link
                      href={`/shop?brand=${encodeURIComponent(brand.name)}`}
                      className="inline-flex items-center text-xs font-mono uppercase tracking-wider text-[#B08D57] hover:text-[#EDE6D6] transition-colors"
                    >
                      <span>Explore {brand.name} Timepieces</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </SiteWrapper>
  );
}
