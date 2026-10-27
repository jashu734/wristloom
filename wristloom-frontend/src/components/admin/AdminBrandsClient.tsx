'use client';

import * as React from 'react';
import {
  Award,
  Plus,
  Search,
  Filter,
  Globe,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Upload,
  Image as ImageIcon,
  X,
  ExternalLink,
  Watch,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { Badge } from '@/components/primitives/Badge';
import { format } from 'date-fns';

export interface BrandItem {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  websiteUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  productCount: number;
}

export function AdminBrandsClient() {
  const [brands, setBrands] = React.useState<BrandItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'inactive'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingBrand, setEditingBrand] = React.useState<BrandItem | null>(null);

  // Form State
  const [formData, setFormData] = React.useState({
    name: '',
    logo: '',
    description: '',
    websiteUrl: '',
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Delete / Restriction State
  const [brandToDelete, setBrandToDelete] = React.useState<BrandItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [notification, setNotification] = React.useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Fetch brands
  const fetchBrands = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/brands');
      if (!res.ok) {
        throw new Error('Failed to load brands');
      }
      const data = await res.json();
      setBrands(data.brands || []);
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: err.message || 'Unable to retrieve watch brands portfolio.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // Auto-dismiss notifications after 5 seconds
  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingBrand(null);
    setFormData({
      name: '',
      logo: '',
      description: '',
      websiteUrl: '',
      isActive: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (brand: BrandItem) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      logo: brand.logo || '',
      description: brand.description || '',
      websiteUrl: brand.websiteUrl || '',
      isActive: brand.isActive,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Handle Logo Upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFormError(null);

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload brand emblem');
      }

      setFormData((prev) => ({ ...prev, logo: data.url }));
    } catch (err: any) {
      setFormError(err.message || 'Emblem upload encountered an error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Form Submit (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Brand name is required.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const url = editingBrand
        ? `/api/admin/brands/${editingBrand.id}`
        : '/api/admin/brands';
      const method = editingBrand ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          logo: formData.logo.trim() || null,
          description: formData.description.trim() || null,
          websiteUrl: formData.websiteUrl.trim() || null,
          isActive: formData.isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Operation failed');
      }

      setNotification({
        type: 'success',
        text: editingBrand
          ? `Brand "${data.brand.name}" updated successfully.`
          : `Brand "${data.brand.name}" registered to atelier portfolio.`,
      });

      setIsModalOpen(false);
      fetchBrands();
    } catch (err: any) {
      setFormError(err.message || 'Error saving brand.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Status (Activate / Deactivate)
  const handleToggleStatus = async (brand: BrandItem) => {
    const nextStatus = !brand.isActive;
    try {
      const res = await fetch(`/api/admin/brands/${brand.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update brand status');
      }

      setNotification({
        type: 'success',
        text: `Brand "${brand.name}" is now ${nextStatus ? 'active' : 'deactivated'}.`,
      });

      setBrands((prev) =>
        prev.map((b) => (b.id === brand.id ? { ...b, isActive: nextStatus } : b))
      );
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: err.message || 'Could not change brand status.',
      });
    }
  };

  // Safe Delete
  const handleConfirmDelete = async () => {
    if (!brandToDelete) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/brands/${brandToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete brand.');
      }

      setNotification({
        type: 'success',
        text: `Brand "${brandToDelete.name}" was permanently removed.`,
      });

      setBrandToDelete(null);
      fetchBrands();
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: err.message || 'Brand deletion restricted.',
      });
      setBrandToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtering
  const filteredBrands = React.useMemo(() => {
    return brands.filter((brand) => {
      const matchesSearch =
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (brand.description &&
          brand.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && brand.isActive) ||
        (statusFilter === 'inactive' && !brand.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [brands, searchQuery, statusFilter]);

  // Aggregate Metrics
  const stats = React.useMemo(() => {
    const total = brands.length;
    const active = brands.filter((b) => b.isActive).length;
    const inactive = total - active;
    const totalProducts = brands.reduce((sum, b) => sum + (b.productCount || 0), 0);
    return { total, active, inactive, totalProducts };
  }, [brands]);

  return (
    <div className="space-y-8">
      {/* ─── Header & Primary CTA ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-5 h-px bg-[#B08D57]" />
            <span className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57]">
              Haute Horlogerie Catalog Architecture
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-[#EDE6D6] tracking-tight">
            Brand Portfolio Management
          </h1>
          <p className="text-xs text-[rgba(237,230,214,0.50)] mt-1">
            Register new watch houses, manage brand emblems, and configure discovery availability across WristLoom.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreate}
          className="cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Register New Brand
        </Button>
      </div>

      {/* ─── Notification Toast Banner ─────────────────────── */}
      {notification && (
        <div
          className={`p-4 rounded-[2px] border text-xs flex items-center justify-between transition-all animate-in fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-red-950/40 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span className="font-medium">{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-[rgba(237,230,214,0.4)] hover:text-[#EDE6D6] ml-4 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── Metric Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-4">
          <div className="flex items-center justify-between text-[rgba(237,230,214,0.40)] mb-1">
            <span className="font-mono text-[9px] uppercase tracking-wider">Total Watch Houses</span>
            <Award className="w-3.5 h-3.5 text-[#B08D57]" />
          </div>
          <p className="font-mono text-2xl font-semibold text-[#EDE6D6]">{stats.total}</p>
        </div>

        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-4">
          <div className="flex items-center justify-between text-[rgba(237,230,214,0.40)] mb-1">
            <span className="font-mono text-[9px] uppercase tracking-wider">Active in Discovery</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="font-mono text-2xl font-semibold text-emerald-400">{stats.active}</p>
        </div>

        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-4">
          <div className="flex items-center justify-between text-[rgba(237,230,214,0.40)] mb-1">
            <span className="font-mono text-[9px] uppercase tracking-wider">Deactivated / Hidden</span>
            <PowerOff className="w-3.5 h-3.5 text-[rgba(237,230,214,0.30)]" />
          </div>
          <p className="font-mono text-2xl font-semibold text-[rgba(237,230,214,0.40)]">
            {stats.inactive}
          </p>
        </div>

        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-4">
          <div className="flex items-center justify-between text-[rgba(237,230,214,0.40)] mb-1">
            <span className="font-mono text-[9px] uppercase tracking-wider">Catalog Timepieces</span>
            <Watch className="w-3.5 h-3.5 text-[#B08D57]" />
          </div>
          <p className="font-mono text-2xl font-semibold text-[#B08D57]">{stats.totalProducts}</p>
        </div>
      </div>

      {/* ─── Search & Status Filter Bar ────────────────────── */}
      <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[rgba(237,230,214,0.40)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search brands or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] pl-9 pr-3 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {(['all', 'active', 'inactive'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                statusFilter === s
                  ? 'bg-[#B08D57] text-[#14110F] font-semibold'
                  : 'bg-[#14110F] text-[rgba(237,230,214,0.50)] hover:text-[#EDE6D6] border border-[rgba(176,141,87,0.15)]'
              }`}
            >
              {s === 'all' ? `All (${stats.total})` : s === 'active' ? `Active (${stats.active})` : `Inactive (${stats.inactive})`}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Brands Table ──────────────────────────────────── */}
      <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#B08D57] animate-spin mb-3" />
            <p className="text-xs text-[rgba(237,230,214,0.50)] font-mono">
              Loading atelier brand registry...
            </p>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="p-12 text-center">
            <Award className="w-10 h-10 text-[rgba(237,230,214,0.20)] mx-auto mb-3" />
            <p className="font-display text-lg text-[#EDE6D6] mb-1">No Watch Brands Found</p>
            <p className="text-xs text-[rgba(237,230,214,0.40)] max-w-sm mx-auto mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search query or status filter to see brands.'
                : 'Your brand portfolio is currently empty. Register your first watch brand to get started.'}
            </p>
            {searchQuery || statusFilter !== 'all' ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
              >
                Reset Filters
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={handleOpenCreate}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Register Brand
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[rgba(176,141,87,0.12)] bg-[#171412] text-[10px] font-mono uppercase tracking-wider text-[rgba(237,230,214,0.45)]">
                  <th className="py-3 px-4">Brand & Emblem</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Timepieces</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(176,141,87,0.06)] text-xs">
                {filteredBrands.map((brand) => (
                  <tr
                    key={brand.id}
                    className="hover:bg-[rgba(176,141,87,0.03)] transition-colors group"
                  >
                    {/* Brand & Emblem */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[2px] bg-[#14110F] border border-[rgba(176,141,87,0.20)] flex items-center justify-center shrink-0 overflow-hidden p-1">
                          {brand.logo ? (
                            <img
                              src={brand.logo}
                              alt={brand.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="font-display text-sm font-semibold text-[#B08D57]">
                              {brand.name.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display text-sm font-medium text-[#EDE6D6]">
                              {brand.name}
                            </span>
                            {brand.websiteUrl && (
                              <a
                                href={brand.websiteUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[rgba(237,230,214,0.30)] hover:text-[#B08D57] transition-colors"
                                title={`Visit ${brand.websiteUrl}`}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <span className="font-mono text-[10px] text-[rgba(237,230,214,0.35)]">
                            slug: {brand.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-[rgba(237,230,214,0.60)] line-clamp-2 text-[11px] leading-relaxed">
                        {brand.description || (
                          <span className="italic text-[rgba(237,230,214,0.30)]">
                            No narrative provided
                          </span>
                        )}
                      </p>
                    </td>

                    {/* Associated Watches */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono text-xs px-2.5 py-1 rounded-[2px] bg-[#14110F] border border-[rgba(176,141,87,0.15)] text-[#B08D57] font-semibold">
                        {brand.productCount} {brand.productCount === 1 ? 'watch' : 'watches'}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={brand.isActive ? 'healthy' : 'neutral'}>
                        {brand.isActive ? '● Active' : '○ Inactive'}
                      </Badge>
                    </td>

                    {/* Registered Date */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[rgba(237,230,214,0.40)]">
                      {format(new Date(brand.createdAt), 'MMM d, yyyy')}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Toggle Status Button */}
                        <button
                          onClick={() => handleToggleStatus(brand)}
                          title={brand.isActive ? 'Deactivate Brand' : 'Activate Brand'}
                          className={`p-1.5 rounded-[2px] border transition-colors cursor-pointer ${
                            brand.isActive
                              ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/40'
                              : 'border-[rgba(176,141,87,0.20)] text-[rgba(237,230,214,0.40)] hover:text-[#EDE6D6] hover:bg-[#1E1A17]'
                          }`}
                        >
                          {brand.isActive ? (
                            <Power className="w-3.5 h-3.5" />
                          ) : (
                            <PowerOff className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(brand)}
                          title="Edit Brand Details"
                          className="p-1.5 rounded-[2px] border border-[rgba(176,141,87,0.20)] text-[rgba(237,230,214,0.60)] hover:text-[#B08D57] hover:border-[#B08D57] transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button (with dependency guard tooltip) */}
                        <button
                          onClick={() => setBrandToDelete(brand)}
                          title={
                            brand.productCount > 0
                              ? `Cannot delete: ${brand.productCount} watches assigned`
                              : 'Delete Brand'
                          }
                          className={`p-1.5 rounded-[2px] border transition-colors cursor-pointer ${
                            brand.productCount > 0
                              ? 'border-red-950/40 text-red-900/60 hover:text-red-400 hover:border-red-500/30'
                              : 'border-[rgba(176,141,87,0.15)] text-[rgba(237,230,214,0.35)] hover:text-red-400 hover:border-red-500/40'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Create / Edit Brand Modal ──────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.25)] rounded-[2px] w-full max-w-lg overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(176,141,87,0.15)] bg-[#171412]">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#B08D57]" />
                <h3 className="font-display text-lg text-[#EDE6D6]">
                  {editingBrand ? `Edit Brand: ${editingBrand.name}` : 'Register New Watch House'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[rgba(237,230,214,0.4)] hover:text-[#EDE6D6] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-[2px] text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Brand Name */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[rgba(237,230,214,0.60)] mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vacheron Constantin, Breitling, Panerai"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3 py-2 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                />
              </div>

              {/* Brand Logo / Emblem */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[rgba(237,230,214,0.60)] mb-1">
                  Brand Logo / Emblem (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-[2px] bg-[#14110F] border border-[rgba(176,141,87,0.20)] flex items-center justify-center shrink-0 overflow-hidden p-1">
                    {formData.logo ? (
                      <img
                        src={formData.logo}
                        alt="Logo Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-[rgba(237,230,214,0.25)]" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-3 py-1.5 bg-[#14110F] border border-[rgba(176,141,87,0.30)] hover:border-[#B08D57] rounded-[2px] text-xs font-mono uppercase tracking-wider text-[#EDE6D6] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isUploading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B08D57]" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 text-[#B08D57]" />
                        )}
                        <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                      </button>

                      {formData.logo && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, logo: '' })}
                          className="text-xs text-[rgba(237,230,214,0.40)] hover:text-red-400 font-mono"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="url"
                      placeholder="Or paste image URL (https://...)"
                      value={formData.logo}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                      className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.15)] rounded-[2px] px-2.5 py-1.5 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[rgba(237,230,214,0.60)] mb-1">
                  Horological Narrative & Heritage (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Historic origins, signature calibers, complications, and atelier hallmarks..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] p-2.5 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none leading-relaxed"
                />
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[rgba(237,230,214,0.60)] mb-1">
                  Official Manufacture Website (Optional)
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-[rgba(237,230,214,0.30)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://www.vacheron-constantin.com"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] pl-9 pr-3 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                  />
                </div>
              </div>

              {/* Active Status Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 rounded-[2px] border border-[rgba(176,141,87,0.15)] bg-[#14110F] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 accent-[#B08D57]"
                  />
                  <div>
                    <span className="text-xs text-[#EDE6D6] font-medium block">
                      Active Status (Available in Discovery & Catalog)
                    </span>
                    <span className="text-[10px] text-[rgba(237,230,214,0.40)] block">
                      When deactivated, existing timepieces remain intact, but the brand is hidden from customer filters and new product assignment.
                    </span>
                  </div>
                </label>
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-[rgba(176,141,87,0.15)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[rgba(176,141,87,0.20)] text-[rgba(237,230,214,0.60)] hover:text-[#EDE6D6] font-mono text-xs uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={isSubmitting}
                  className="cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      Saving Brand...
                    </>
                  ) : editingBrand ? (
                    'Save Changes'
                  ) : (
                    'Register Brand'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation / Restriction Dialog ──────── */}
      {brandToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.25)] rounded-[2px] w-full max-w-md overflow-hidden shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg text-[#EDE6D6]">
                  {brandToDelete.productCount > 0 ? 'Deletion Restricted' : 'Confirm Brand Deletion'}
                </h3>
                <p className="font-mono text-[10px] text-[rgba(237,230,214,0.40)]">
                  {brandToDelete.name}
                </p>
              </div>
            </div>

            {brandToDelete.productCount > 0 ? (
              /* Restricted State */
              <div className="space-y-4">
                <div className="p-3.5 bg-amber-950/30 border border-amber-600/30 rounded-[2px] text-xs text-amber-200/90 leading-relaxed space-y-2">
                  <div className="flex items-center gap-2 font-medium text-amber-400">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Referential Integrity Protection</span>
                  </div>
                  <p>
                    This brand is currently linked to{' '}
                    <strong className="text-[#EDE6D6] font-mono">
                      {brandToDelete.productCount} active timepiece(s)
                    </strong>{' '}
                    in your catalog. Blindly deleting it would orphan product and order histories.
                  </p>
                  <p className="text-[11px] text-[rgba(237,230,214,0.60)]">
                    Recommendation: Deactivate the brand instead. It will immediately vanish from customer filter dropdowns and new product creation while preserving historical data.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setBrandToDelete(null)}
                    className="px-4 py-2 border border-[rgba(176,141,87,0.20)] text-[rgba(237,230,214,0.60)] hover:text-[#EDE6D6] font-mono text-xs uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      const b = brandToDelete;
                      setBrandToDelete(null);
                      handleToggleStatus(b);
                    }}
                    className="px-4 py-2 bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 font-mono text-xs uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer"
                  >
                    Deactivate Brand Instead
                  </button>
                </div>
              </div>
            ) : (
              /* Safe Delete Confirmation */
              <div className="space-y-4">
                <p className="text-xs text-[rgba(237,230,214,0.70)] leading-relaxed">
                  Are you sure you want to permanently delete{' '}
                  <strong className="text-[#EDE6D6]">{brandToDelete.name}</strong> from your brand portfolio? This action cannot be undone.
                </p>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setBrandToDelete(null)}
                    disabled={isDeleting}
                    className="px-4 py-2 border border-[rgba(176,141,87,0.20)] text-[rgba(237,230,214,0.60)] hover:text-[#EDE6D6] font-mono text-xs uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono text-xs uppercase tracking-wider rounded-[2px] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
