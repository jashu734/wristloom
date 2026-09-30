'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/primitives/Badge';
import { ArrowRight, ShoppingBag, Zap, Check, ShieldCheck, Clock, Award } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { useCartStore } from '@/store/cartStore';

// ─── Featured Collections ─────────────────────────────────────
// Features a primary flagship timepiece with complete description,
// transparent INR pricing, technical specifications, and 1-click acquisition.

export function FeaturedCollections() {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [featured, ...rest] = MOCK_PRODUCTS.slice(0, 4);

  const [heroAdded, setHeroAdded] = React.useState(false);
  const [addedMap, setAddedMap] = React.useState<{ [key: string]: boolean }>({});

  const handleAddToCart = (product: typeof featured, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.modelName || product.name,
      brand: product.brand,
      reference_number: product.referenceNumber || product.reference_number,
      price: product.purchaseValue ?? product.price,
      image: product.imageUrl || product.images[0],
      caseSize: product.caseSize || product.case_size,
      movementType: product.movementType || product.movement_type,
      stock: product.stock,
    });

    if (product.id === featured.id) {
      setHeroAdded(true);
      setTimeout(() => setHeroAdded(false), 2000);
    } else {
      setAddedMap((prev) => ({ ...prev, [product.id]: true }));
      setTimeout(() => setAddedMap((prev) => ({ ...prev, [product.id]: false })), 2000);
    }
  };

  const handleBuyNow = (product: typeof featured, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    handleAddToCart(product);
    router.push('/cart');
  };

  return (
    <section className="section-padding bg-[#14110F]" aria-labelledby="collections-heading">
      <div className="container-wl">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-px bg-[#B08D57]" />
              <span className="text-overline">Atelier Retail Showcase</span>
            </div>
            <h2
              id="collections-heading"
              className="font-display text-3xl md:text-4xl text-[#EDE6D6] tracking-tight"
            >
              Featured Timepieces
            </h2>
            <p className="text-xs text-[rgba(237,230,214,0.55)] mt-1 max-w-lg">
              Every timepiece in our atelier is 100% authentic, certified by master horologists, and backed by comprehensive transit insurance.
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/shop">
              Browse All Watches <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </div>

        {/* Grid — 1 detailed showcase hero + 3 supporting timepieces */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

          {/* ─── Hero Product: Full Specifications & Direct Acquisition ─── */}
          <div className="lg:col-span-7 bg-[#1E1A17] border border-[rgba(176,141,87,0.25)] rounded-[2px] overflow-hidden flex flex-col justify-between shadow-2xl relative">
            
            {/* Top Bar with Availability & Reference */}
            <div className="px-6 py-3.5 bg-[#14110F]/90 border-b border-[rgba(176,141,87,0.12)] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 uppercase tracking-widest text-[10px] font-semibold">
                  In Stock · Ready for Dispatch
                </span>
              </div>
              <span className="text-[rgba(237,230,214,0.45)] uppercase tracking-wider text-[10px]">
                Ref. {featured.reference_number}
              </span>
            </div>

            {/* Product Imagery */}
            <Link
              href={`/products/${featured.slug}`}
              className="group block relative aspect-[16/10] sm:aspect-[16/9] overflow-hidden bg-[#14110F] p-8 flex items-center justify-center cursor-pointer"
            >
              <img
                src={featured.images[0]}
                alt={`${featured.brand} ${featured.name}`}
                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-[1.05]"
                loading="eager"
              />
              <div className="absolute top-4 right-4">
                <Badge variant={featured.condition === 'New' ? 'brass' : 'certified'}>
                  {featured.condition} · Brand New
                </Badge>
              </div>
            </Link>

            {/* Product Details & Specifications */}
            <div className="p-6 md:p-8 bg-[#1E1A17] border-t border-[rgba(176,141,87,0.10)] flex-1 flex flex-col justify-between">
              <div>
                <p className="font-mono text-xs tracking-widest uppercase text-[#B08D57] font-semibold mb-1">
                  {featured.brand}
                </p>
                <h3 className="font-display text-2xl md:text-3xl text-[#EDE6D6] mb-2 tracking-tight">
                  <Link href={`/products/${featured.slug}`} className="hover:text-[#B08D57] transition-colors">
                    {featured.name}
                  </Link>
                </h3>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="font-mono text-2xl md:text-3xl text-[#B08D57] font-semibold">
                    {formatCurrency(featured.price)}
                  </span>
                  <span className="font-mono text-[11px] text-[rgba(237,230,214,0.45)] uppercase tracking-wider">
                    Incl. of all taxes &amp; express delivery
                  </span>
                </div>

                {/* Product Description */}
                <p className="text-xs md:text-sm text-[rgba(237,230,214,0.65)] leading-relaxed mb-6">
                  {featured.description}
                </p>

                {/* Technical Specs Compact Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-[rgba(176,141,87,0.10)] mb-6 text-xs font-mono">
                  <div>
                    <span className="text-[rgba(237,230,214,0.35)] uppercase text-[9px] block">Movement</span>
                    <span className="text-[#EDE6D6] font-medium">{featured.movement_caliber || 'Automatic'}</span>
                  </div>
                  <div>
                    <span className="text-[rgba(237,230,214,0.35)] uppercase text-[9px] block">Case Dimension</span>
                    <span className="text-[#EDE6D6] font-medium">{featured.case_size || '40.5 mm'}</span>
                  </div>
                  <div>
                    <span className="text-[rgba(237,230,214,0.35)] uppercase text-[9px] block">Dial Finish</span>
                    <span className="text-[#EDE6D6] font-medium">{featured.dial_color || 'Sunburst'}</span>
                  </div>
                  <div>
                    <span className="text-[rgba(237,230,214,0.35)] uppercase text-[9px] block">Warranty</span>
                    <span className="text-emerald-400 font-medium">2-Year Official</span>
                  </div>
                </div>
              </div>

              {/* Direct Purchase Actions */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="oxblood"
                    size="lg"
                    className="flex-1 cursor-pointer shadow-lg shadow-amber-950/20"
                    onClick={(e) => handleBuyNow(featured, e)}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Buy Now ({formatCurrency(featured.price)})
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1 cursor-pointer"
                    onClick={(e) => handleAddToCart(featured, e)}
                  >
                    {heroAdded ? (
                      <>
                        <Check className="w-4 h-4 mr-2 text-emerald-400" />
                        Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-[rgba(237,230,214,0.40)] uppercase tracking-wider pt-2">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#B08D57]" /> Verified Authenticity
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#B08D57]" /> Same-Day Atelier Dispatch
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-[#B08D57]" /> Razorpay Checkout
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── 3 Supporting Products ─── */}
          <div className="lg:col-span-5 flex flex-col gap-4 justify-between">
            {rest.map((product) => {
              const isAdded = addedMap[product.id];
              return (
                <div
                  key={product.id}
                  className="group bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] hover:border-[#B08D57] rounded-[2px] overflow-hidden transition-all duration-300 flex flex-col sm:flex-row"
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="w-full sm:w-40 h-40 flex-shrink-0 bg-[#14110F] p-3 flex items-center justify-center border-b sm:border-b-0 sm:border-r border-[rgba(176,141,87,0.10)]"
                  >
                    <img
                      src={product.images[0]}
                      alt={`${product.brand} ${product.name}`}
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.06]"
                      loading="lazy"
                    />
                  </Link>
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] font-semibold">
                          {product.brand}
                        </span>
                        <Badge variant={product.condition === 'New' ? 'brass' : 'certified'}>
                          {product.condition}
                        </Badge>
                      </div>
                      <h4 className="font-display text-base text-[#EDE6D6] mb-1">
                        <Link href={`/products/${product.slug}`} className="hover:text-[#B08D57] transition-colors">
                          {product.name}
                        </Link>
                      </h4>
                      <p className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] mb-2">
                        Ref. {product.reference_number}
                      </p>
                      <p className="font-mono text-sm text-[#B08D57] font-semibold mb-3">
                        {formatCurrency(product.price)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 text-xs py-1.5 cursor-pointer"
                        onClick={(e) => handleBuyNow(product, e)}
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Buy Now
                      </Button>
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className="px-2.5 py-1.5 rounded-[2px] border border-[rgba(176,141,87,0.25)] text-[#EDE6D6] hover:border-[#B08D57] hover:text-[#B08D57] transition-colors text-xs font-mono cursor-pointer"
                        aria-label={`Add ${product.name} to cart`}
                      >
                        {isAdded ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile view all link */}
        <div className="mt-8 sm:hidden">
          <Button variant="ghost" size="md" className="w-full" asChild>
            <Link href="/shop">Browse All Luxury Watches</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
