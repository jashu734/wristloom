'use client';

import * as React from 'react';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { WATCH_BRANDS } from '@/lib/constants';
import Link from 'next/link';
import { SlidersHorizontal, X, ArrowRight, Heart } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlistStore';

type MovementFilter = 'Automatic' | 'Manual' | 'Quartz' | 'Spring Drive';
type ConditionFilter = 'New' | 'Certified Pre-Owned' | 'Pre-Owned';

interface Filters {
  brands: string[];
  movements: MovementFilter[];
  conditions: ConditionFilter[];
  maxPrice: number;
}

// ─── Shop Grid ────────────────────────────────────────────────
export function ShopGrid() {
  const { isInWishlist, toggleItem } = useWishlistStore();
  const [products, setProducts] = React.useState<any[]>(MOCK_PRODUCTS);
  const [filters, setFilters] = React.useState<Filters>({
    brands: [],
    movements: [],
    conditions: [],
    maxPrice: 10000000,
  });
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    fetch('/api/products')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.products && d.products.length > 0) {
          const mapped = d.products.map((p: any) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            brand: p.brand,
            reference_number: p.referenceNumber,
            price: p.price,
            currency: p.currency,
            images: p.images?.length > 0 ? p.images : ['https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=90'],
            description: p.description,
            movement_type: p.movementType || 'Automatic',
            movement_caliber: p.movementCaliber || '',
            power_reserve: p.powerReserve || '',
            case_material: p.caseMaterial || 'Stainless Steel',
            case_size: p.caseSize || '41mm',
            dial_color: p.dialColor || 'Black',
            condition: p.condition || 'New',
            in_stock: p.inStock,
            collection: p.collection || '',
            tags: p.tags || [],
          }));
          setProducts(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const filtered = React.useMemo(() => {
    return products.filter((p) => {
      if (filters.brands.length > 0 && !filters.brands.includes(p.brand)) return false;
      if (filters.movements.length > 0 && !filters.movements.includes(p.movement_type as MovementFilter)) return false;
      if (filters.conditions.length > 0 && !filters.conditions.includes(p.condition as ConditionFilter)) return false;
      if (p.price > filters.maxPrice) return false;
      return true;
    });
  }, [filters, products]);

  const activeFilterCount =
    filters.brands.length + filters.movements.length + filters.conditions.length;

  function toggleBrand(brand: string) {
    setFilters((f) => ({
      ...f,
      brands: f.brands.includes(brand)
        ? f.brands.filter((b) => b !== brand)
        : [...f.brands, brand],
    }));
  }

  function toggleMovement(m: MovementFilter) {
    setFilters((f) => ({
      ...f,
      movements: f.movements.includes(m)
        ? f.movements.filter((x) => x !== m)
        : [...f.movements, m],
    }));
  }

  function clearFilters() {
    setFilters({ brands: [], movements: [], conditions: [], maxPrice: 10000000 });
  }

  return (
    <div className="container-wl py-8 md:py-12">
      <div className="flex gap-8">

        {/* ─── Filter Sidebar ───────────────────────────── */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#1E1A17] border-r border-[rgba(176,141,87,0.12)] p-6 overflow-y-auto transition-transform duration-300 md:static md:w-56 md:flex-shrink-0 md:translate-x-0 md:bg-transparent md:border-0 md:p-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
          aria-label="Product filters"
        >
          <div className="flex items-center justify-between mb-6 md:hidden">
            <h2 className="font-mono text-[11px] tracking-widest uppercase text-[#B08D57]">Filters</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-[rgba(237,230,214,0.50)] hover:text-[#EDE6D6]"
              aria-label="Close filters"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Clear filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-[11px] font-mono tracking-wider uppercase text-[rgba(237,230,214,0.45)] hover:text-[#EDE6D6] transition-colors mb-6 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
            </button>
          )}

          {/* Brand filter */}
          <FilterGroup label="Brand">
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {WATCH_BRANDS.slice(0, 12).map((brand) => (
                <FilterCheckbox
                  key={brand}
                  label={brand}
                  checked={filters.brands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                />
              ))}
            </div>
          </FilterGroup>

          {/* Movement filter */}
          <FilterGroup label="Movement">
            {(['Automatic', 'Manual', 'Quartz', 'Spring Drive'] as MovementFilter[]).map((m) => (
              <FilterCheckbox
                key={m}
                label={m}
                checked={filters.movements.includes(m)}
                onChange={() => toggleMovement(m)}
              />
            ))}
          </FilterGroup>

          {/* Condition filter */}
          <FilterGroup label="Condition">
            {(['New', 'Certified Pre-Owned', 'Pre-Owned'] as ConditionFilter[]).map((c) => (
              <FilterCheckbox
                key={c}
                label={c}
                checked={filters.conditions.includes(c)}
                onChange={() =>
                  setFilters((f) => ({
                    ...f,
                    conditions: f.conditions.includes(c)
                      ? f.conditions.filter((x) => x !== c)
                      : [...f.conditions, c],
                  }))
                }
              />
            ))}
          </FilterGroup>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-[#14110F]/60 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}

        {/* ─── Product Grid ─────────────────────────────── */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase text-[rgba(237,230,214,0.55)] hover:text-[#EDE6D6] transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
              <span className="font-mono text-[11px] tracking-widest uppercase text-[rgba(237,230,214,0.35)]">
                {filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}
              </span>
            </div>
          </div>

          {/* Products */}
          {filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-display text-xl text-[#EDE6D6] mb-2">No watches match your filters</p>
              <p className="text-sm text-[rgba(237,230,214,0.50)] mb-6">
                Try broadening your selection or clearing all filters.
              </p>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((product) => {
                const inWishlist = isInWishlist(product.id);
                return (
                  <div
                    key={product.id}
                    className="group relative bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] hover:border-[rgba(176,141,87,0.25)] rounded-[2px] overflow-hidden transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Floating Wishlist Heart */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleItem({
                          id: product.id,
                          slug: product.slug,
                          name: product.name,
                          brand: product.brand,
                          reference_number: product.reference_number,
                          price: product.price,
                          image: product.images[0],
                          condition: product.condition,
                          year: product.year,
                        });
                      }}
                      className="absolute top-3 right-3 z-10 p-2 rounded-full bg-[rgba(20,17,15,0.75)] backdrop-blur-sm border border-[rgba(176,141,87,0.20)] hover:border-[#B08D57] text-[#EDE6D6] transition-all hover:scale-105"
                      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          inWishlist ? 'fill-[#B08D57] text-[#B08D57]' : 'text-[rgba(237,230,214,0.60)]'
                        }`}
                      />
                    </button>

                    <Link
                      href={`/products/${product.slug}`}
                      className="flex-1 flex flex-col"
                      aria-label={`${product.brand} ${product.name}`}
                    >
                      {/* Image */}
                      <div className="aspect-square overflow-hidden bg-[#14110F]">
                        <img
                          src={product.images[0]}
                          alt={`${product.brand} ${product.name}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          loading="lazy"
                        />
                      </div>

                      {/* Info */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] mb-1">
                                {product.brand}
                              </p>
                              <h3 className="font-display text-base text-[#EDE6D6]">{product.name}</h3>
                            </div>
                            <Badge variant={product.condition === 'New' ? 'brass' : 'certified'} className="flex-shrink-0 mt-0.5">
                              {product.condition === 'New' ? 'New' : 'CPO'}
                            </Badge>
                          </div>

                          {/* Specs in mono */}
                          <div className="flex items-center gap-3 mb-3">
                            <span className="font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.35)]">
                              {product.reference_number}
                            </span>
                            <span className="font-mono text-[10px] text-[rgba(237,230,214,0.25)]">·</span>
                            <span className="font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.35)]">
                              {product.case_size}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="font-mono text-sm text-[#B08D57]">
                            {formatCurrency(product.price)}
                          </span>
                          <ArrowRight className="w-4 h-4 text-[rgba(176,141,87,0.30)] group-hover:text-[#B08D57] transition-colors" />
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Filter helpers ───────────────────────────────────────────

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="font-mono text-[10px] tracking-[0.15em] uppercase text-[rgba(237,230,214,0.40)] mb-3">
        {label}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div
        className={`w-3.5 h-3.5 rounded-[1px] border flex items-center justify-center flex-shrink-0 transition-all ${
          checked
            ? 'bg-[#B08D57] border-[#B08D57]'
            : 'border-[rgba(176,141,87,0.25)] group-hover:border-[rgba(176,141,87,0.50)]'
        }`}
        onClick={onChange}
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onChange()}
      >
        {checked && (
          <svg viewBox="0 0 8 8" className="w-2 h-2" fill="none">
            <path d="M1 4l2 2 4-4" stroke="#14110F" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <span className="text-sm text-[rgba(237,230,214,0.60)] group-hover:text-[#EDE6D6] transition-colors">
        {label}
      </span>
    </label>
  );
}
