'use client';

import * as React from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { Plus, Edit2, Trash2, Search, Filter, ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { WATCH_BRANDS } from '@/lib/constants';

interface Product {
  id: string;
  slug: string;
  name: string;
  modelName?: string | null;
  brand: string;
  referenceNumber: string | null;
  price: number;
  purchaseValue?: number | null;
  caseSize?: string | null;
  movementType?: string | null;
  stockCount: number;
  stock?: number | null;
  inStock: boolean;
  isActive?: boolean;
  images: string[];
  imageUrl?: string | null;
  condition?: string;
  description?: string;
}

const MOVEMENT_TYPES = [
  'Automatic',
  'Manual Wind',
  'Quartz',
  'Solar',
  'Eco-Drive',
  'Automatic Chronograph',
];

export function AdminProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = React.useState<Product[]>(initialProducts);

  // Filters
  const [search, setSearch] = React.useState('');
  const [selectedBrand, setSelectedBrand] = React.useState('all');
  const [selectedMovement, setSelectedMovement] = React.useState('all');
  const [modelSearch, setModelSearch] = React.useState('');
  const [refSearch, setRefSearch] = React.useState('');

  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filtered products list
  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      const pModel = (p.modelName || p.name || '').toLowerCase();
      const pBrand = (p.brand || '').toLowerCase();
      const pRef = (p.referenceNumber || '').toLowerCase();
      const pDesc = (p.description || '').toLowerCase();
      const pMovement = (p.movementType || '').toLowerCase();

      // Global search
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchesGlobal =
          pModel.includes(q) ||
          pBrand.includes(q) ||
          pRef.includes(q) ||
          pDesc.includes(q);
        if (!matchesGlobal) return false;
      }

      // Brand filter
      if (selectedBrand !== 'all') {
        if (pBrand !== selectedBrand.toLowerCase()) return false;
      }

      // Movement type filter
      if (selectedMovement !== 'all') {
        if (!pMovement.includes(selectedMovement.toLowerCase())) return false;
      }

      // Model name search
      if (modelSearch.trim()) {
        if (!pModel.includes(modelSearch.trim().toLowerCase())) return false;
      }

      // Reference number search
      if (refSearch.trim()) {
        if (!pRef.includes(refSearch.trim().toLowerCase())) return false;
      }

      return true;
    });
  }, [products, search, selectedBrand, selectedMovement, modelSearch, refSearch]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate or remove "${name}" from the active watch catalog?`)) {
      return;
    }

    setActionLoadingId(id);
    setFeedbackMessage(null);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete product');
      }

      if (data.softDeleted) {
        // Soft-deactivated
        setProducts((prev) =>
          prev.map((item) => (item.id === id ? { ...item, isActive: false, inStock: false } : item))
        );
        setFeedbackMessage({
          type: 'success',
          text: `"${name}" deactivated. Historical order records preserved.`,
        });
      } else {
        // Hard deleted
        setProducts((prev) => prev.filter((item) => item.id !== id));
        setFeedbackMessage({
          type: 'success',
          text: `"${name}" removed from watch catalog.`,
        });
      }
    } catch (err: any) {
      console.error(err);
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Error executing product deletion',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleActive = async (p: Product) => {
    const nextState = !(p.isActive !== false);
    setActionLoadingId(p.id);
    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextState, inStock: nextState }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((item) => (item.id === p.id ? { ...item, isActive: nextState, inStock: nextState } : item))
        );
        setFeedbackMessage({
          type: 'success',
          text: `Catalog status updated to ${nextState ? 'Active' : 'Inactive'}`,
        });
      }
    } catch (e: any) {
      console.error(e);
      setFeedbackMessage({ type: 'error', text: 'Failed to update catalog status' });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Notifications */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-[2px] border text-xs flex items-center justify-between gap-2.5 ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-red-950/40 border-red-800/60 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs opacity-60 hover:opacity-100 font-mono"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Action Row & Global Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(237,230,214,0.30)]" />
          <input
            type="text"
            placeholder="Global search (brand, model, ref, description)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] pl-9 pr-4 py-2.5 text-xs text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.30)] focus:border-[#B08D57] focus:outline-none"
          />
        </div>

        <Link
          href="/admin/products/add"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#B08D57] text-[#14110F] text-xs font-mono tracking-wider uppercase font-semibold rounded-[2px] hover:bg-[#c29f68] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Watch</span>
        </Link>
      </div>

      {/* Filter Bar with Brand, Movement, Model Search, Reference Search */}
      <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] p-4 rounded-[2px] space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#B08D57] mb-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Catalog Filters & Search</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Brand Filter */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[rgba(237,230,214,0.50)] mb-1">
              Brand Filter (12 Brands)
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
            >
              <option value="all">All Brands (12 Authorized)</option>
              {WATCH_BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Movement Type Filter */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[rgba(237,230,214,0.50)] mb-1">
              Movement Type Filter
            </label>
            <select
              value={selectedMovement}
              onChange={(e) => setSelectedMovement(e.target.value)}
              className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
            >
              <option value="all">All Movement Types</option>
              {MOVEMENT_TYPES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Model Search */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[rgba(237,230,214,0.50)] mb-1">
              Model Search
            </label>
            <input
              type="text"
              placeholder="e.g. Presage, Edge..."
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3 py-2 text-xs text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.30)] focus:border-[#B08D57] focus:outline-none"
            />
          </div>

          {/* Reference Number Search */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[rgba(237,230,214,0.50)] mb-1">
              Reference Number Search
            </label>
            <input
              type="text"
              placeholder="e.g. SRPB43J1, 1595..."
              value={refSearch}
              onChange={(e) => setRefSearch(e.target.value)}
              className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3 py-2 text-xs text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.30)] focus:border-[#B08D57] focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Active filter count & reset */}
        {(selectedBrand !== 'all' || selectedMovement !== 'all' || modelSearch || refSearch || search) && (
          <div className="flex items-center justify-between pt-2 border-t border-[rgba(176,141,87,0.08)]">
            <span className="text-[11px] font-mono text-[rgba(237,230,214,0.50)]">
              Showing {filteredProducts.length} of {products.length} catalog timepieces
            </span>
            <button
              onClick={() => {
                setSearch('');
                setSelectedBrand('all');
                setSelectedMovement('all');
                setModelSearch('');
                setRefSearch('');
              }}
              className="flex items-center gap-1 text-[11px] font-mono text-[#B08D57] hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Catalog Table */}
      <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-[rgba(176,141,87,0.12)] bg-[rgba(20,17,15,0.60)]">
                <th className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] px-4 py-3">Watch & Model</th>
                <th className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] px-4 py-3">Reference</th>
                <th className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] px-4 py-3">Case Size</th>
                <th className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] px-4 py-3">Movement</th>
                <th className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] px-4 py-3">Purchase Value</th>
                <th className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] px-4 py-3">Stock</th>
                <th className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] px-4 py-3">Status</th>
                <th className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(176,141,87,0.06)]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-xs text-[rgba(237,230,214,0.40)]">
                    No timepieces found matching the selected search criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const imageSrc =
                    p.imageUrl || (p.images && p.images.length > 0 ? p.images[0] : '/watches/placeholder-watch.svg');
                  const purchaseVal = p.purchaseValue ?? p.price;
                  const stockQty = p.stock ?? p.stockCount;
                  const isDeactivated = p.isActive === false;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-[rgba(176,141,87,0.04)] transition-colors ${
                        isDeactivated ? 'opacity-60 bg-[rgba(20,17,15,0.30)]' : ''
                      }`}
                    >
                      {/* Watch Image & Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-[2px] border border-[rgba(176,141,87,0.18)] bg-[#14110F] flex items-center justify-center p-1 flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imageSrc}
                              alt={p.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/watches/placeholder-watch.svg';
                              }}
                            />
                          </div>
                          <div>
                            <span className="font-mono text-[9px] uppercase tracking-wider text-[#B08D57] block">
                              {p.brand}
                            </span>
                            <p className="text-xs font-medium text-[#EDE6D6] font-display">
                              {p.modelName || p.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Reference Number */}
                      <td className="px-4 py-3 font-mono text-[11px] text-[rgba(237,230,214,0.65)]">
                        {p.referenceNumber || '—'}
                      </td>

                      {/* Case Size */}
                      <td className="px-4 py-3 text-xs text-[rgba(237,230,214,0.65)]">
                        {p.caseSize || '—'}
                      </td>

                      {/* Movement */}
                      <td className="px-4 py-3 text-xs text-[rgba(237,230,214,0.65)]">
                        {p.movementType || '—'}
                      </td>

                      {/* Purchase Value */}
                      <td className="px-4 py-3 font-mono text-xs text-[#EDE6D6] font-semibold">
                        {formatCurrency(purchaseVal)}
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-3 font-mono text-xs">
                        <span className={stockQty <= 2 ? 'text-amber-400 font-semibold' : 'text-[rgba(237,230,214,0.65)]'}>
                          {stockQty} units
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActive(p)}
                          disabled={actionLoadingId === p.id}
                          className={`font-mono text-[9px] uppercase tracking-wider px-2 py-1 rounded-[1px] border transition-colors ${
                            !isDeactivated
                              ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20'
                              : 'text-zinc-400 border-zinc-700 bg-zinc-800/40 hover:bg-zinc-800'
                          }`}
                          title="Click to toggle catalog visibility"
                        >
                          {!isDeactivated ? 'Active' : 'Deactivated'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/edit/${p.id}`}
                            className="p-1.5 text-[rgba(237,230,214,0.50)] hover:text-[#B08D57] transition-colors rounded-[1px] border border-transparent hover:border-[rgba(176,141,87,0.30)]"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id, p.modelName || p.name)}
                            disabled={actionLoadingId === p.id}
                            className="p-1.5 text-[rgba(237,230,214,0.50)] hover:text-red-400 transition-colors rounded-[1px] border border-transparent hover:border-red-500/30"
                            title="Delete or Deactivate Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
