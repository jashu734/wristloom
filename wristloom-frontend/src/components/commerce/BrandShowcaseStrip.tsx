'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Award } from 'lucide-react';

interface BrandSummary {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  productCount: number;
}

export function BrandShowcaseStrip({ initialBrands = [] }: { initialBrands?: BrandSummary[] }) {
  const [brands, setBrands] = React.useState<BrandSummary[]>(initialBrands);
  const [loading, setLoading] = React.useState(initialBrands.length === 0);

  React.useEffect(() => {
    if (initialBrands.length > 0) return;
    fetch('/api/brands')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.brands && Array.isArray(data.brands)) {
          setBrands(data.brands);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [initialBrands.length]);

  if (!loading && brands.length === 0) return null;

  return (
    <section className="bg-[#171412] border-y border-[rgba(176,141,87,0.12)] py-12 md:py-16">
      <div className="container-wl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-px bg-[#B08D57]" />
              <span className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57]">
                Manufacture Heritage
              </span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl text-[#EDE6D6] tracking-tight">
              Authorized Watch Houses
            </h2>
          </div>
          <Link
            href="/brands"
            className="inline-flex items-center text-xs font-mono uppercase tracking-wider text-[#B08D57] hover:text-[#EDE6D6] transition-colors"
          >
            <span>Explore All {brands.length > 0 ? `${brands.length} Houses` : 'Brands'}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </div>

        {/* Brand Chips / Cards Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {brands.slice(0, 12).map((brand) => (
            <Link
              key={brand.id}
              href={`/shop?brand=${encodeURIComponent(brand.name)}`}
              className="bg-[#1E1A17] border border-[rgba(176,141,87,0.12)] hover:border-[#B08D57] p-3.5 rounded-[2px] flex items-center gap-3 transition-all group"
            >
              <div className="w-9 h-9 rounded-[2px] bg-[#14110F] border border-[rgba(176,141,87,0.15)] flex items-center justify-center shrink-0 p-1">
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    width={32}
                    height={32}
                    loading="lazy"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="font-display text-xs font-semibold text-[#B08D57]">
                    {brand.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-display text-xs text-[#EDE6D6] group-hover:text-[#B08D57] transition-colors block truncate">
                  {brand.name}
                </span>
                <span className="font-mono text-[9px] text-[rgba(237,230,214,0.35)] block">
                  {brand.productCount} {brand.productCount === 1 ? 'watch' : 'watches'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
