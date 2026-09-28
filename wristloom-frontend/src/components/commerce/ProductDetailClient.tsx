'use client';

import * as React from 'react';
import type { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { ShoppingBag, Wrench, ChevronLeft, ChevronRight, Check, Heart, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';

interface ProductDetailClientProps {
  product: Product;
}

// ─── Product Detail Client Component ─────────────────────────
export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [selectedStrap, setSelectedStrap] = React.useState(product.strap_options[0]);
  const [added, setAdded] = React.useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);

  const totalPrice = product.price + (selectedStrap?.price_addon ?? 0);

  function handleAddToCart() {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      reference_number: product.reference_number,
      price: product.price,
      image: product.images[0],
      strapOption: selectedStrap ? { id: selectedStrap.id, material: selectedStrap.material, price_addon: selectedStrap.price_addon } : undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    handleAddToCart();
    router.push('/cart');
  }

  function handleToggleWishlist() {
    toggleWishlist({
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      reference_number: product.reference_number,
      price: product.price,
      image: product.images[0],
      condition: product.condition,
    });
  }

  return (
    <div className="min-h-screen bg-[#14110F]">
      <div className="container-wl py-8 md:py-16">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8" aria-label="Breadcrumb">
          <Link href="/shop" className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] hover:text-[#B08D57] transition-colors">
            Shop
          </Link>
          <span className="text-[rgba(237,230,214,0.25)]">/</span>
          <span className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)]">
            {product.brand}
          </span>
          <span className="text-[rgba(237,230,214,0.25)]">/</span>
          <span className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57]">
            {product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

          {/* ─── Image Gallery ──────────────────────────── */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="relative aspect-square bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] overflow-hidden group">
              <img
                src={product.images[selectedImage]}
                alt={`${product.brand} ${product.name} — view ${selectedImage + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Navigation arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((i) => Math.max(0, i - 1))}
                    disabled={selectedImage === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-[rgba(20,17,15,0.70)] border border-[rgba(176,141,87,0.20)] rounded-[2px] flex items-center justify-center text-[#EDE6D6] opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((i) => Math.min(product.images.length - 1, i + 1))}
                    disabled={selectedImage === product.images.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-[rgba(20,17,15,0.70)] border border-[rgba(176,141,87,0.20)] rounded-[2px] flex items-center justify-center text-[#EDE6D6] opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 flex-shrink-0 rounded-[2px] overflow-hidden border transition-all ${
                      selectedImage === i
                        ? 'border-[#B08D57]'
                        : 'border-[rgba(176,141,87,0.10)] hover:border-[rgba(176,141,87,0.30)]'
                    }`}
                    aria-label={`View image ${i + 1}`}
                    aria-pressed={selectedImage === i}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Product Info ────────────────────────────── */}
          <div>
            {/* Brand + badges */}
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-xs tracking-widest uppercase text-[#B08D57]">
                {product.brand}
              </span>
              <Badge variant={product.condition === 'New' ? 'brass' : 'certified'}>
                {product.condition}
              </Badge>
              {product.collection && (
                <span className="font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.35)]">
                  {product.collection}
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="font-display text-3xl md:text-4xl text-[#EDE6D6] tracking-tight mb-2">
              {product.name}
            </h1>

            {/* Reference in mono */}
            <p className="font-mono text-sm tracking-widest uppercase text-[rgba(237,230,214,0.40)] mb-6">
              Ref. {product.reference_number}
            </p>

            {/* Price */}
            <p className="font-mono text-2xl text-[#B08D57] mb-6">
              {formatCurrency(totalPrice)}
            </p>

            <div className="divider mb-6" />

            {/* Description */}
            <p className="text-[rgba(237,230,214,0.65)] text-sm leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Strap selection */}
            {product.strap_options.length > 1 && (
              <div className="mb-6">
                <h2 className="font-mono text-[11px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-3">
                  Strap / Bracelet
                </h2>
                <div className="flex flex-wrap gap-2">
                  {product.strap_options.map((strap) => (
                    <button
                      key={strap.id}
                      onClick={() => setSelectedStrap(strap)}
                      className={`text-xs font-mono tracking-wider uppercase px-3 py-2 rounded-[2px] border transition-all ${
                        selectedStrap?.id === strap.id
                          ? 'border-[#B08D57] text-[#B08D57] bg-[rgba(176,141,87,0.10)]'
                          : 'border-[rgba(176,141,87,0.20)] text-[rgba(237,230,214,0.55)] hover:border-[rgba(176,141,87,0.40)]'
                      }`}
                      aria-pressed={selectedStrap?.id === strap.id}
                    >
                      {strap.material}
                      {strap.price_addon > 0 && (
                        <span className="ml-1 text-[rgba(237,230,214,0.40)]">
                          +{formatCurrency(strap.price_addon)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="primary" size="lg" className="flex-1" disabled={!product.in_stock} onClick={handleAddToCart}>
                  {added ? <Check className="w-4 h-4 mr-1 text-emerald-400" /> : <ShoppingBag className="w-4 h-4 mr-1" />}
                  {!product.in_stock ? 'Out of Stock' : added ? 'Added to Cart!' : 'Add to Cart'}
                </Button>
                <Button
                  variant="oxblood"
                  size="lg"
                  className="flex-1"
                  disabled={!product.in_stock}
                  onClick={handleBuyNow}
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Buy Now
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  variant={isInWishlist ? 'subtle' : 'ghost'}
                  size="md"
                  className="flex-1"
                  onClick={handleToggleWishlist}
                >
                  <Heart className={`w-4 h-4 mr-1 ${isInWishlist ? 'text-[#B08D57] fill-[#B08D57]' : ''}`} />
                  {isInWishlist ? 'In Wishlist' : 'Save to Wishlist'}
                </Button>
                <Button variant="ghost" size="md" className="flex-1" asChild>
                  <Link href="/services/repair">
                    <Wrench className="w-4 h-4 mr-1" />
                    Book a Service
                  </Link>
                </Button>
              </div>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-4 text-[11px] font-mono tracking-wider uppercase text-[rgba(237,230,214,0.35)]">
              <span>✓ Fully Insured Shipping</span>
              <span>✓ 2-Year Warranty</span>
              <span>✓ Authenticity Guaranteed</span>
            </div>

            <div className="divider my-8" />

            {/* Spec Table */}
            <div>
              <h2 className="font-mono text-[11px] tracking-[0.15em] uppercase text-[rgba(237,230,214,0.40)] mb-4">
                Technical Specifications
              </h2>
              <dl className="space-y-0">
                {[
                  { label: 'Movement', value: `${product.movement_type} · Cal. ${product.movement_caliber}` },
                  ...(product.power_reserve ? [{ label: 'Power Reserve', value: product.power_reserve }] : []),
                  { label: 'Case Material', value: product.case_material },
                  { label: 'Case Size', value: product.case_size },
                  ...(product.case_thickness ? [{ label: 'Case Thickness', value: product.case_thickness }] : []),
                  { label: 'Dial', value: product.dial_color },
                  { label: 'Crystal', value: product.crystal },
                  ...(product.water_resistance ? [{ label: 'Water Resistance', value: product.water_resistance }] : []),
                  ...(product.year ? [{ label: 'Year', value: String(product.year) }] : []),
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-baseline justify-between py-2.5 border-b border-[rgba(176,141,87,0.08)]"
                  >
                    <dt className="font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.40)]">
                      {label}
                    </dt>
                    <dd className="font-mono text-[11px] tracking-wider text-[rgba(237,230,214,0.70)] text-right">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="divider my-8" />

            {/* Craftsmanship Narrative */}
            <div>
              <h2 className="font-mono text-[11px] tracking-[0.15em] uppercase text-[rgba(237,230,214,0.40)] mb-4">
                The Craft
              </h2>
              <p className="text-sm text-[rgba(237,230,214,0.55)] leading-relaxed italic font-display text-base">
                &ldquo;{product.craftsmanship_narrative}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
