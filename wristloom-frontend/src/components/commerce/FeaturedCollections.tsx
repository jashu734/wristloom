import * as React from 'react';
import Link from 'next/link';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/primitives/Badge';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/primitives/Button';

// ─── Featured Collections ─────────────────────────────────────
// Editorial-style showcase: 1 large hero product + 3 supporting

export function FeaturedCollections() {
  const [featured, ...rest] = MOCK_PRODUCTS.slice(0, 4);

  return (
    <section className="section-padding bg-[#14110F]" aria-labelledby="collections-heading">
      <div className="container-wl">

        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-overline block mb-3">Curated Selection</span>
            <h2
              id="collections-heading"
              className="font-display text-3xl md:text-4xl text-[#EDE6D6] tracking-tight"
            >
              Featured Timepieces
            </h2>
          </div>
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/shop">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        {/* Grid — 1 hero + 3 cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">

          {/* Hero Product */}
          <Link
            href={`/products/${featured.slug}`}
            className="group relative bg-[#1E1A17] overflow-hidden rounded-[2px] border border-[rgba(176,141,87,0.10)] hover:border-[rgba(176,141,87,0.25)] transition-all duration-300"
            aria-label={`${featured.brand} ${featured.name}`}
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={featured.images[0]}
                alt={`${featured.brand} ${featured.name}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                loading="eager"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[rgba(20,17,15,0.95)] via-[rgba(20,17,15,0.60)] to-transparent">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={featured.condition === 'New' ? 'brass' : 'certified'}>
                  {featured.condition}
                </Badge>
                <span className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)]">
                  {featured.reference_number}
                </span>
              </div>
              <p className="font-mono text-[11px] tracking-widest uppercase text-[#B08D57] mb-1">
                {featured.brand}
              </p>
              <h3 className="font-display text-xl text-[#EDE6D6] mb-2">{featured.name}</h3>
              <p className="font-mono text-sm text-[#B08D57]">{formatCurrency(featured.price)}</p>
            </div>
          </Link>

          {/* 3 Supporting Products */}
          <div className="flex flex-col gap-4 lg:gap-6">
            {rest.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group flex gap-4 bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] hover:border-[rgba(176,141,87,0.25)] rounded-[2px] overflow-hidden transition-all duration-300"
                aria-label={`${product.brand} ${product.name}`}
              >
                <div className="w-28 sm:w-36 flex-shrink-0 overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={`${product.brand} ${product.name}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 p-4 flex flex-col justify-center">
                  <p className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] mb-1">
                    {product.brand}
                  </p>
                  <h3 className="font-display text-base text-[#EDE6D6] mb-1">{product.name}</h3>
                  <p className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] mb-2">
                    {product.reference_number}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-[#B08D57]">{formatCurrency(product.price)}</span>
                    <Badge variant={product.condition === 'New' ? 'brass' : 'certified'}>
                      {product.condition}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center pr-4 text-[rgba(176,141,87,0.30)] group-hover:text-[#B08D57] transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile view all link */}
        <div className="mt-8 sm:hidden">
          <Button variant="ghost" size="md" className="w-full" asChild>
            <Link href="/shop">View All Watches</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
