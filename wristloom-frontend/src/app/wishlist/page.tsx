'use client';

import * as React from 'react';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { Heart, Trash2, ArrowRight, ShoppingBag, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/primitives/Button';
import Link from 'next/link';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);

  const addItemToCart = useCartStore((s) => s.addItem);
  const [addedIds, setAddedIds] = React.useState<Record<string, boolean>>({});

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const handleAddToCart = (item: (typeof items)[0]) => {
    addItemToCart({
      id: item.id,
      slug: item.slug,
      name: item.name,
      brand: item.brand,
      reference_number: item.reference_number,
      price: item.price,
      image: item.image,
    });
    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  return (
    <SiteWrapper>
      <div className="min-h-screen bg-[#14110F]">
        {/* Header */}
        <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
          <div className="container-wl py-12">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-5 h-5 text-[#B08D57] fill-[#B08D57]" />
              <h1 className="font-display text-3xl text-[#EDE6D6] tracking-tight">Your Wishlist</h1>
            </div>
            <p className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)]">
              {items.length} {items.length === 1 ? 'saved timepiece' : 'saved timepieces'}
            </p>
          </div>
        </div>

        <div className="container-wl py-12">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-[rgba(176,141,87,0.08)] border border-[rgba(176,141,87,0.20)] flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-[rgba(176,141,87,0.40)]" />
              </div>
              <h2 className="font-display text-2xl text-[#EDE6D6] mb-2">Your wishlist is empty</h2>
              <p className="text-sm text-[rgba(237,230,214,0.50)] max-w-sm mb-8 leading-relaxed">
                Save timepieces as you browse our curated haute horlogerie collection to track availability and price updates.
              </p>
              <Button variant="primary" size="lg" asChild>
                <Link href="/shop">
                  Explore Collection <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <p className="text-xs text-[rgba(237,230,214,0.50)]">
                  Personal curation saved to your device.
                </p>
                <button
                  onClick={clearWishlist}
                  className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] hover:text-red-400 transition-colors"
                >
                  Clear Wishlist
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#1E1A17] border border-[rgba(176,141,87,0.12)] rounded-[2px] overflow-hidden flex flex-col justify-between group hover:border-[rgba(176,141,87,0.30)] transition-all duration-300"
                  >
                    <div>
                      {/* Image */}
                      <Link href={`/products/${item.slug}`} className="block relative aspect-square bg-[#14110F] overflow-hidden">
                        <img
                          src={item.image}
                          alt={`${item.brand} ${item.name}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            removeItem(item.id);
                          }}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[rgba(20,17,15,0.75)] border border-[rgba(176,141,87,0.25)] flex items-center justify-center text-red-400 hover:bg-red-950/60 transition-colors"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </Link>

                      {/* Content */}
                      <div className="p-5">
                        <p className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] mb-1">{item.brand}</p>
                        <h3 className="font-display text-lg text-[#EDE6D6] mb-1">
                          <Link href={`/products/${item.slug}`} className="hover:text-[#B08D57] transition-colors">
                            {item.name}
                          </Link>
                        </h3>
                        <p className="font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.40)] mb-3">
                          Ref. {item.reference_number}
                        </p>
                        <p className="font-mono text-base text-[#B08D57] font-semibold">{formatCurrency(item.price)}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-5 pt-0">
                      <Button
                        variant={addedIds[item.id] ? 'subtle' : 'primary'}
                        size="md"
                        className="w-full"
                        onClick={() => handleAddToCart(item)}
                      >
                        {addedIds[item.id] ? (
                          <>
                            <Check className="w-4 h-4 mr-1 text-emerald-400" /> Added to Cart
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4 mr-1" /> Add to Cart
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </SiteWrapper>
  );
}
