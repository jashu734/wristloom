'use client';

import * as React from 'react';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { WATCH_BRANDS } from '@/lib/constants';
import Link from 'next/link';
import { SlidersHorizontal, X, ArrowRight, Heart, Search, ShoppingBag, Check } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';

type MovementFilter = 'Automatic' | 'Manual' | 'Quartz' | 'Eco-Drive Solar' | 'Spring Drive';

interface Filters {
  search: string;
  brands: string[];
  movements: string[];
  caseSizes: string[];
  sort: 'newest' | 'price-asc' | 'price-desc' | 'name-asc';
}

export function ShopGrid() {
  const { isInWishlist, toggleItem } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  const [loading, setLoading] = React.useState(true);
  const [products, setProducts] = React.useState<any[]>([]);
  const [addedIds, setAddedIds] = React.useState<Record<string, boolean>>({});

  const [filters, setFilters] = React.useState<Filters>({
    search: '',
    brands: [],
    movements: [],
    caseSizes: [],
    sort: 'newest',
  });
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    fetch('/api/products')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.products && d.products.length > 0) {
          const mapped = d.products.map((p: any) => ({
            id: p.id,
            slug: p.slug,
            name: p.modelName || p.name,
            modelName: p.modelName || p.name,
            brand: p.brand,
            referenceNumber: p.referenceNumber || p.reference_number || 'N/A',
            reference_number: p.referenceNumber || p.reference_number || 'N/A',
            price: p.purchaseValue ?? p.price,
            purchaseValue: p.purchaseValue ?? p.price,
            currency: p.currency || 'INR',
            images: p.images?.length > 0 ? p.images : [p.imageUrl || '/watches/placeholder-watch.svg'],
            imageUrl: p.imageUrl || p.images?.[0] || '/watches/placeholder-watch.svg',
            description: p.description,
            movementType: p.movementType || 'Automatic',
            movement_type: p.movementType || 'Automatic',
            caseSize: p.caseSize || '40 mm',
            case_size: p.caseSize || '40 mm',
            dialColor: p.dialColor || 'Black',
            condition: p.condition || 'New',
            inStock: p.inStock,
            stock: p.stock ?? p.stockCount ?? 5,
            collection: p.collection || '',
            tags: p.tags || [],
          }));
          setProducts(mapped);
        } else {
          setProducts(MOCK_PRODUCTS);
        }
      })
      .catch(() => {
        setProducts(MOCK_PRODUCTS);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAddToCart = async (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    await addItem({
      id: product.id,
      slug: product.slug,
      name: product.modelName || product.name,
      brand: product.brand,
      reference_number: product.referenceNumber || product.reference_number,
      referenceNumber: product.referenceNumber || product.reference_number,
      price: product.purchaseValue ?? product.price,
      purchaseValue: product.purchaseValue ?? product.price,
      image: product.imageUrl || product.images?.[0] || '/watches/placeholder-watch.svg',
      caseSize: product.caseSize,
      movementType: product.movementType,
      stock: product.stock,
    });

    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  const filtered = React.useMemo(() => {
    return products.filter((p) => {
      // 1. Text Search across Model Name, Reference Number, and Brand
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const matchesName = (p.name || '').toLowerCase().includes(query);
        const matchesModel = (p.modelName || '').toLowerCase().includes(query);
        const matchesRef = (p.referenceNumber || p.reference_number || '').toLowerCase().includes(query);
        const matchesBrand = (p.brand || '').toLowerCase().includes(query);
        if (!matchesName && !matchesModel && !matchesRef && !matchesBrand) return false;
      }

      // 2. Brand filter (ONLY the 12 specified brands)
      if (filters.brands.length > 0 && !filters.brands.includes(p.brand)) {
        return false;
      }

      // 3. Movement Type filter
      if (filters.movements.length > 0) {
        const pMove = (p.movementType || p.movement_type || '').toLowerCase();
        const matches = filters.movements.some((m) => pMove.includes(m.toLowerCase()));
        if (!matches) return false;
      }

      // 4. Case Size filter
      if (filters.caseSizes.length > 0) {
        const sizeNum = parseFloat(p.caseSize || p.case_size || '0');
        const matchesSize = filters.caseSizes.some((bracket) => {
          if (bracket === '< 40 mm') return sizeNum < 40;
          if (bracket === '40 - 42 mm') return sizeNum >= 40 && sizeNum <= 42;
          if (bracket === '> 42 mm') return sizeNum > 42;
          return false;
        });
        if (!matchesSize) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sort === 'price-asc') return (a.purchaseValue ?? a.price) - (b.purchaseValue ?? b.price);
      if (filters.sort === 'price-desc') return (b.purchaseValue ?? b.price) - (a.purchaseValue ?? a.price);
      if (filters.sort === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });
  }, [filters, products]);

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    filters.brands.length +
    filters.movements.length +
    filters.caseSizes.length;

  function toggleBrand(brand: string) {
    setFilters((f) => ({
      ...f,
      brands: f.brands.includes(brand) ? f.brands.filter((b) => b !== brand) : [...f.brands, brand],
    }));
  }

  function toggleMovement(m: string) {
    setFilters((f) => ({
      ...f,
      movements: f.movements.includes(m) ? f.movements.filter((x) => x !== m) : [...f.movements, m],
    }));
  }

  function toggleCaseSize(size: string) {
    setFilters((f) => ({
      ...f,
      caseSizes: f.caseSizes.includes(size) ? f.caseSizes.filter((x) => x !== size) : [...f.caseSizes, size],
    }));
  }

  function clearFilters() {
    setFilters({
      search: '',
      brands: [],
      movements: [],
      caseSizes: [],
      sort: 'newest',
    });
  }

  return (
    <div className="container-wl py-8 md:py-12">
      {/* ─── Search & Sort Bar ───────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 pb-6 border-b border-[rgba(176,141,87,0.12)]">
        {/* Model / Reference Search Box */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B08D57]" />
          <input
            type="text"
            placeholder="Search by Model Name (e.g. Cocktail Time) or Reference (e.g. SRPB43J1)..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="w-full bg-[#1E1A17] border border-[rgba(176,141,87,0.20)] rounded-[2px] pl-10 pr-4 py-2.5 text-xs text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.35)] focus:border-[#B08D57] focus:outline-none transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => setFilters((f) => ({ ...f, search: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(237,230,214,0.4)] hover:text-[#EDE6D6]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort by Purchase Value */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <label className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] shrink-0">
            Sort By:
          </label>
          <select
            value={filters.sort}
            onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value as any }))}
            className="bg-[#1E1A17] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-asc">Purchase Value: Low to High</option>
            <option value="price-desc">Purchase Value: High to Low</option>
            <option value="name-asc">Model Name (A-Z)</option>
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* ─── Filter Sidebar ───────────────────────────── */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#1E1A17] border-r border-[rgba(176,141,87,0.12)] p-6 overflow-y-auto transition-transform duration-300 md:static md:w-60 md:flex-shrink-0 md:translate-x-0 md:bg-transparent md:border-0 md:p-0 ${
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
              className="text-[11px] font-mono tracking-wider uppercase text-[rgba(237,230,214,0.45)] hover:text-[#EDE6D6] transition-colors mb-6 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" /> Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
            </button>
          )}

          {/* Brand Filter (ONLY 12 ALLOWED BRANDS) */}
          <FilterGroup label="Brand">
            <div className="space-y-0.5 max-h-72 overflow-y-auto pr-1">
              {WATCH_BRANDS.map((brand) => (
                <FilterCheckbox
                  key={brand}
                  label={brand}
                  checked={filters.brands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                />
              ))}
            </div>
          </FilterGroup>

          {/* Movement Type Filter */}
          <FilterGroup label="Movement Type">
            {['Automatic', 'Manual', 'Quartz', 'Eco-Drive Solar'].map((m) => (
              <FilterCheckbox
                key={m}
                label={m}
                checked={filters.movements.includes(m)}
                onChange={() => toggleMovement(m)}
              />
            ))}
          </FilterGroup>

          {/* Case Size Filter */}
          <FilterGroup label="Case Size">
            {['< 40 mm', '40 - 42 mm', '> 42 mm'].map((s) => (
              <FilterCheckbox
                key={s}
                label={s}
                checked={filters.caseSizes.includes(s)}
                onChange={() => toggleCaseSize(s)}
              />
            ))}
          </FilterGroup>
        </aside>

        {/* Mobile Filter Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-[#14110F]/60 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}

        {/* ─── Product Grid ─────────────────────────────── */}
        <div className="flex-1">
          {/* Mobile Toolbar */}
          <div className="flex items-center justify-between mb-6 md:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase text-[rgba(237,230,214,0.55)] hover:text-[#EDE6D6] transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
            <span className="font-mono text-[11px] tracking-widest uppercase text-[rgba(237,230,214,0.35)]">
              {filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}
            </span>
          </div>

          {/* Products List */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] overflow-hidden animate-pulse flex flex-col justify-between">
                  <div className="w-full aspect-square bg-[rgba(237,230,214,0.04)]" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 w-1/4 bg-[rgba(176,141,87,0.2)] rounded" />
                    <div className="h-4 w-3/4 bg-[rgba(237,230,214,0.08)] rounded" />
                    <div className="h-4 w-1/2 bg-[rgba(176,141,87,0.25)] rounded mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-8">
              <p className="font-display text-xl text-[#EDE6D6] mb-2">No watches match your search criteria</p>
              <p className="text-sm text-[rgba(237,230,214,0.50)] mb-6">
                Try searching for another model, reference number, or clearing active filters.
              </p>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((product) => {
                const inWishlist = isInWishlist(product.id);
                const isAdded = Boolean(addedIds[product.id]);
                const imageUrl = product.imageUrl || product.images?.[0] || '/watches/placeholder-watch.svg';

                return (
                  <div
                    key={product.id}
                    className="group relative bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] hover:border-[#B08D57] rounded-[2px] overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-2xl"
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
                          name: product.modelName || product.name,
                          brand: product.brand,
                          reference_number: product.referenceNumber || product.reference_number,
                          price: product.purchaseValue ?? product.price,
                          image: imageUrl,
                          condition: product.condition,
                        });
                      }}
                      className="absolute top-3 right-3 z-10 p-2 rounded-full bg-[rgba(20,17,15,0.85)] backdrop-blur-sm border border-[rgba(176,141,87,0.20)] hover:border-[#B08D57] text-[#EDE6D6] transition-all hover:scale-105"
                      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          inWishlist ? 'fill-[#B08D57] text-[#B08D57]' : 'text-[rgba(237,230,214,0.60)]'
                        }`}
                      />
                    </button>

                    {/* Product Card Content */}
                    <Link
                      href={`/products/${product.slug}`}
                      className="flex-1 flex flex-col cursor-pointer"
                      aria-label={`${product.brand} ${product.modelName || product.name}`}
                    >
                      {/* [Correct Product Image] */}
                      <div className="aspect-square overflow-hidden bg-[#14110F] relative flex items-center justify-center p-4">
                        <img
                          src={imageUrl}
                          alt={`${product.brand} ${product.modelName || product.name} ${product.referenceNumber || ''}`}
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>

                      {/* Watch Specifications Required Details */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Brand */}
                          <p className="font-mono text-[11px] tracking-widest uppercase text-[#B08D57] font-semibold mb-1">
                            {product.brand}
                          </p>

                          {/* Model Name */}
                          <h3 className="font-display text-lg text-[#EDE6D6] leading-snug mb-1 group-hover:text-[#B08D57] transition-colors">
                            {product.modelName || product.name}
                          </h3>

                          {/* Reference Number */}
                          <p className="font-mono text-xs tracking-wider uppercase text-[rgba(237,230,214,0.50)] font-medium mb-3">
                            {product.referenceNumber || product.reference_number}
                          </p>

                          {/* Case Size & Movement Type */}
                          <div className="flex items-center gap-2 mb-4 text-xs font-mono text-[rgba(237,230,214,0.65)]">
                            <span className="bg-[#14110F] px-2 py-0.5 rounded border border-[rgba(176,141,87,0.15)]">
                              {product.caseSize || product.case_size || '40 mm'}
                            </span>
                            <span>·</span>
                            <span className="bg-[#14110F] px-2 py-0.5 rounded border border-[rgba(176,141,87,0.15)]">
                              {product.movementType || product.movement_type || 'Automatic'}
                            </span>
                          </div>
                        </div>

                        {/* Purchase Value & Action Button */}
                        <div className="pt-3 border-t border-[rgba(176,141,87,0.10)]">
                          <div className="flex items-baseline justify-between mb-3">
                            <span className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)]">
                              Purchase Value
                            </span>
                            <span className="font-mono text-base font-semibold text-[#B08D57]">
                              {formatCurrency(product.purchaseValue ?? product.price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* [ Add to Cart ] Button */}
                    <div className="p-4 pt-0">
                      <Button
                        type="button"
                        variant="primary"
                        size="md"
                        onClick={(e) => handleAddToCart(product, e)}
                        className={`w-full font-mono text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-[#B08D57] text-[#14110F] hover:bg-[#C5A059] border-[#B08D57]'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-4 h-4" />
                            Added to Cart
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            Add to Cart
                          </>
                        )}
                      </Button>
                    </div>
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
      <div className="pb-1.5 mb-2.5 border-b border-[rgba(176,141,87,0.15)]">
        <h3 className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#B08D57] font-semibold">
          {label}
        </h3>
      </div>
      <div className="space-y-1">{children}</div>
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
    <label
      onClick={onChange}
      className={`group flex items-center gap-2.5 text-xs font-mono tracking-wide cursor-pointer select-none py-1 px-1.5 rounded-[2px] transition-all ${
        checked
          ? 'bg-[rgba(176,141,87,0.10)] text-[#EDE6D6]'
          : 'text-[rgba(237,230,214,0.65)] hover:bg-[rgba(176,141,87,0.05)] hover:text-[#EDE6D6]'
      }`}
    >
      <div
        className={`w-3.5 h-3.5 rounded-[1px] flex items-center justify-center flex-shrink-0 transition-all border ${
          checked
            ? 'bg-[#B08D57] border-[#B08D57] text-[#14110F]'
            : 'bg-[#14110F] border-[rgba(176,141,87,0.30)] group-hover:border-[#B08D57]'
        }`}
      >
        {checked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
      </div>
      <span className="whitespace-nowrap text-[12px]">{label}</span>
    </label>
  );
}
