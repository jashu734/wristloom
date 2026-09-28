'use client';

import * as React from 'react';
import { formatCurrency } from '@/lib/utils';
import { Plus, Edit2, Trash2, Check, X, Loader2, Package, Search } from 'lucide-react';
import { Button } from '@/components/primitives/Button';

interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  referenceNumber: string | null;
  price: number;
  stockCount: number;
  inStock: boolean;
  images: string[];
  movementType?: string | null;
  condition: string;
}

export function AdminProductsClient({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = React.useState<Product[]>(initialProducts);
  const [search, setSearch] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editPrice, setEditPrice] = React.useState<number>(0);
  const [editStock, setEditStock] = React.useState<number>(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // New product form
  const [newForm, setNewForm] = React.useState({
    name: '',
    brand: '',
    referenceNumber: '',
    price: '',
    description: '',
    images: '',
    stockCount: '1',
    condition: 'New',
  });

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase()) ||
    (p.referenceNumber && p.referenceNumber.toLowerCase().includes(search.toLowerCase()))
  );

  async function handleToggleStock(p: Product) {
    const nextState = !p.inStock;
    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inStock: nextState }),
      });
      if (res.ok) {
        setProducts((prev) => prev.map((item) => (item.id === p.id ? { ...item, inStock: nextState } : item)));
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSaveQuickEdit(id: string) {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: Number(editPrice), stockCount: Number(editStock) }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((item) => (item.id === id ? { ...item, price: Number(editPrice), stockCount: Number(editStock) } : item))
        );
        setEditingId(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to remove this timepiece from the active catalog?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const imagesArr = newForm.images
        ? newForm.images.split('\n').map((url) => url.trim()).filter(Boolean)
        : ['https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=90'];

      const payload = {
        name: newForm.name,
        brand: newForm.brand,
        referenceNumber: newForm.referenceNumber || undefined,
        price: Number(newForm.price),
        description: newForm.description,
        images: imagesArr,
        stockCount: Number(newForm.stockCount) || 1,
        condition: newForm.condition,
        inStock: true,
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to create product');
      }

      setProducts((prev) => [data.product, ...prev]);
      setIsAdding(false);
      setNewForm({
        name: '',
        brand: '',
        referenceNumber: '',
        price: '',
        description: '',
        images: '',
        stockCount: '1',
        condition: 'New',
      });
    } catch (err: any) {
      alert(err.message || 'Error creating timepiece');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(237,230,214,0.30)]" />
          <input
            type="text"
            placeholder="Search watches by name, brand, or reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] pl-9 pr-4 py-2 text-xs text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.30)] focus:border-[#B08D57] focus:outline-none"
          />
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Timepiece
        </Button>
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.25)] rounded-[2px] max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-[rgba(176,141,87,0.10)] pb-3">
              <h2 className="font-display text-xl text-[#EDE6D6]">Catalog New Timepiece</h2>
              <button onClick={() => setIsAdding(false)} className="text-[rgba(237,230,214,0.40)] hover:text-[#EDE6D6]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-[#B08D57] mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rolex, Omega"
                    value={newForm.brand}
                    onChange={(e) => setNewForm({ ...newForm, brand: e.target.value })}
                    className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.15)] rounded px-3 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-[#B08D57] mb-1">Model Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Submariner Date"
                    value={newForm.name}
                    onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                    className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.15)] rounded px-3 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-[#B08D57] mb-1">Reference Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 126610LN"
                    value={newForm.referenceNumber}
                    onChange={(e) => setNewForm({ ...newForm, referenceNumber: e.target.value })}
                    className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.15)] rounded px-3 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-[#B08D57] mb-1">Price (INR)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1450000"
                    value={newForm.price}
                    onChange={(e) => setNewForm({ ...newForm, price: e.target.value })}
                    className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.15)] rounded px-3 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-[#B08D57] mb-1">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={newForm.stockCount}
                    onChange={(e) => setNewForm({ ...newForm, stockCount: e.target.value })}
                    className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.15)] rounded px-3 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-[#B08D57] mb-1">Condition</label>
                  <select
                    value={newForm.condition}
                    onChange={(e) => setNewForm({ ...newForm, condition: e.target.value })}
                    className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.15)] rounded px-3 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                  >
                    <option value="New">New / Unworn</option>
                    <option value="Certified Pre-Owned">Certified Pre-Owned</option>
                    <option value="Vintage">Vintage Museum</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#B08D57] mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Horological narrative and technical highlights..."
                  value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.15)] rounded px-3 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#B08D57] mb-1">Image URLs (one per line)</label>
                <textarea
                  rows={2}
                  placeholder="https://images.unsplash.com/..."
                  value={newForm.images}
                  onChange={(e) => setNewForm({ ...newForm, images: e.target.value })}
                  className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.15)] rounded px-3 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none font-mono"
                />
              </div>

              <div className="pt-3 border-t border-[rgba(176,141,87,0.10)] flex justify-end gap-3">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
                  Save Timepiece
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-[rgba(176,141,87,0.10)] bg-[rgba(20,17,15,0.40)]">
                {['Watch', 'Reference', 'Condition', 'Price', 'Inventory', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(176,141,87,0.06)]">
              {filtered.map((p) => {
                const isEditingThis = editingId === p.id;
                return (
                  <tr key={p.id} className="hover:bg-[rgba(176,141,87,0.04)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=200&q=80'}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-[2px] border border-[rgba(176,141,87,0.15)] flex-shrink-0"
                        />
                        <div>
                          <p className="font-mono text-[9px] uppercase tracking-wider text-[#B08D57]">{p.brand}</p>
                          <p className="text-sm font-medium text-[#EDE6D6]">{p.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-[rgba(237,230,214,0.45)]">
                      {p.referenceNumber || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-[rgba(237,230,214,0.60)]">
                      {p.condition}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">
                      {isEditingThis ? (
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(Number(e.target.value))}
                          className="w-28 bg-[#14110F] border border-[#B08D57] rounded px-2 py-1 text-xs text-[#EDE6D6]"
                        />
                      ) : (
                        <span className="text-[#EDE6D6] font-semibold">{formatCurrency(p.price)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {isEditingThis ? (
                        <input
                          type="number"
                          value={editStock}
                          onChange={(e) => setEditStock(Number(e.target.value))}
                          className="w-16 bg-[#14110F] border border-[#B08D57] rounded px-2 py-1 text-xs text-[#EDE6D6]"
                        />
                      ) : (
                        <span className={p.stockCount <= 1 ? 'text-amber-400' : 'text-[rgba(237,230,214,0.60)]'}>
                          {p.stockCount} units
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStock(p)}
                        className={`font-mono text-[9px] uppercase tracking-wider px-2 py-1 rounded-[1px] border transition-colors ${
                          p.inStock
                            ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20'
                            : 'text-red-400 border-red-500/30 bg-red-500/10 hover:bg-red-500/20'
                        }`}
                      >
                        {p.inStock ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isEditingThis ? (
                          <>
                            <button
                              onClick={() => handleSaveQuickEdit(p.id)}
                              disabled={isSubmitting}
                              className="p-1.5 text-emerald-400 hover:text-emerald-300"
                              title="Save"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 text-zinc-400 hover:text-zinc-300"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(p.id);
                                setEditPrice(p.price);
                                setEditStock(p.stockCount);
                              }}
                              className="p-1.5 text-[rgba(237,230,214,0.40)] hover:text-[#B08D57] transition-colors"
                              title="Edit Price & Stock"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-1.5 text-[rgba(237,230,214,0.40)] hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
