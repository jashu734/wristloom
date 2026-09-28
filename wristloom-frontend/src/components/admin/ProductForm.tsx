'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/primitives/Button';
import { ArrowLeft, Save, Plus, Trash2, Watch, CheckCircle2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface ProductFormProps {
  initialData?: {
    id?: string;
    slug?: string;
    name: string;
    brand: string;
    referenceNumber?: string | null;
    price: number;
    description: string;
    craftsmanshipNarrative?: string | null;
    movementType?: string | null;
    movementCaliber?: string | null;
    powerReserve?: string | null;
    caseMaterial?: string | null;
    caseSize?: string | null;
    caseThickness?: string | null;
    dialColor?: string | null;
    crystal?: string | null;
    waterResistance?: string | null;
    condition?: string;
    year?: number | null;
    inStock?: boolean;
    stockCount: number;
    images?: string[];
  };
  isEditing?: boolean;
}

export function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    name: initialData?.name || '',
    brand: initialData?.brand || '',
    referenceNumber: initialData?.referenceNumber || '',
    price: initialData?.price ? String(initialData.price) : '',
    stockCount: initialData?.stockCount !== undefined ? String(initialData.stockCount) : '1',
    condition: initialData?.condition || 'New',
    year: initialData?.year ? String(initialData.year) : new Date().getFullYear().toString(),
    inStock: initialData?.inStock !== undefined ? initialData.inStock : true,
    movementType: initialData?.movementType || 'Automatic',
    movementCaliber: initialData?.movementCaliber || '',
    powerReserve: initialData?.powerReserve || '48 Hours',
    caseMaterial: initialData?.caseMaterial || 'Oystersteel',
    caseSize: initialData?.caseSize || '40mm',
    dialColor: initialData?.dialColor || 'Black',
    crystal: initialData?.crystal || 'Sapphire',
    waterResistance: initialData?.waterResistance || '100m',
    description: initialData?.description || '',
    craftsmanshipNarrative: initialData?.craftsmanshipNarrative || '',
    imageUrl: initialData?.images?.[0] || '',
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const payload = {
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      referenceNumber: formData.referenceNumber.trim() || undefined,
      price: parseFloat(formData.price) || 0,
      stockCount: parseInt(formData.stockCount, 10) || 0,
      condition: formData.condition,
      year: formData.year ? parseInt(formData.year, 10) : undefined,
      inStock: Boolean(formData.inStock),
      movementType: formData.movementType || undefined,
      movementCaliber: formData.movementCaliber || undefined,
      powerReserve: formData.powerReserve || undefined,
      caseMaterial: formData.caseMaterial || undefined,
      caseSize: formData.caseSize || undefined,
      dialColor: formData.dialColor || undefined,
      crystal: formData.crystal || undefined,
      waterResistance: formData.waterResistance || undefined,
      description: formData.description.trim(),
      craftsmanshipNarrative: formData.craftsmanshipNarrative.trim() || undefined,
      images: formData.imageUrl.trim() ? [formData.imageUrl.trim()] : [],
    };

    try {
      const url = isEditing && initialData?.id ? `/api/products/${initialData.id}` : '/api/products';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (!res.ok) {
        setStatusMessage({ type: 'error', text: resData.error || 'Failed to save timepiece' });
        return;
      }

      setStatusMessage({
        type: 'success',
        text: isEditing ? 'Timepiece updated successfully.' : 'Timepiece created successfully.',
      });

      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Network error while saving timepiece' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3.5 py-2.5 text-xs text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.30)] focus:border-[#B08D57] focus:outline-none transition-colors';
  const labelClass = 'block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.50)] mb-1.5';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[rgba(176,141,87,0.15)]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 bg-[#1E1A17] border border-[rgba(176,141,87,0.20)] hover:border-[#B08D57] rounded-[2px] text-[rgba(237,230,214,0.60)] hover:text-[#EDE6D6] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] block mb-0.5">
              Watch Inventory
            </span>
            <h1 className="font-display text-2xl text-[#EDE6D6]">
              {isEditing ? `Edit: ${initialData?.name}` : 'Acquire New Watch into Catalog'}
            </h1>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-[2px] border text-xs flex items-center gap-2.5 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-red-950/40 border-red-800/60 text-red-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="font-display text-base text-[#EDE6D6] mb-4 pb-2 border-b border-[rgba(176,141,87,0.10)] flex items-center gap-2">
            <Watch className="w-4 h-4 text-[#B08D57]" />
            <span>Timepiece Identity</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Watch Name *</label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Submariner Date"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Maison / Brand *</label>
              <input
                required
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Rolex, Omega, Patek Philippe"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Reference Number</label>
              <input
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleChange}
                placeholder="e.g. 126610LN"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div>
          <h2 className="font-display text-base text-[#EDE6D6] mb-4 pb-2 border-b border-[rgba(176,141,87,0.10)]">
            Valuation & Stock
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Price (INR ₹) *</label>
              <input
                required
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 1250000"
                min="1"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Stock Count *</label>
              <input
                required
                type="number"
                name="stockCount"
                value={formData.stockCount}
                onChange={handleChange}
                min="0"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Condition</label>
              <select name="condition" value={formData.condition} onChange={handleChange} className={inputClass}>
                <option value="New">Brand New / Unworn</option>
                <option value="Pre-Owned">Pre-Owned Mint</option>
                <option value="Vintage">Vintage Collector Piece</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Year of Production</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="2026"
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <input
              type="checkbox"
              id="inStock"
              name="inStock"
              checked={formData.inStock}
              onChange={handleChange}
              className="w-4 h-4 accent-[#B08D57]"
            />
            <label htmlFor="inStock" className="text-xs text-[rgba(237,230,214,0.70)] select-none">
              Active in Boutique Catalog (Immediate purchase enabled)
            </label>
          </div>
        </div>

        {/* Horological Specifications */}
        <div>
          <h2 className="font-display text-base text-[#EDE6D6] mb-4 pb-2 border-b border-[rgba(176,141,87,0.10)]">
            Horological Specifications
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Movement Type</label>
              <input
                name="movementType"
                value={formData.movementType}
                onChange={handleChange}
                placeholder="Automatic, Manual-Wind, Tourbillon"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Movement Caliber</label>
              <input
                name="movementCaliber"
                value={formData.movementCaliber}
                onChange={handleChange}
                placeholder="e.g. 3235"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Power Reserve</label>
              <input
                name="powerReserve"
                value={formData.powerReserve}
                onChange={handleChange}
                placeholder="e.g. 70 Hours"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Case Material</label>
              <input
                name="caseMaterial"
                value={formData.caseMaterial}
                onChange={handleChange}
                placeholder="Oystersteel, 18ct Rose Gold, Platinum"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Case Diameter</label>
              <input
                name="caseSize"
                value={formData.caseSize}
                onChange={handleChange}
                placeholder="e.g. 41mm"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Dial Color</label>
              <input
                name="dialColor"
                value={formData.dialColor}
                onChange={handleChange}
                placeholder="Black, Sunburst Blue, Olive Green"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Crystal</label>
              <input
                name="crystal"
                value={formData.crystal}
                onChange={handleChange}
                placeholder="Scratch-resistant Sapphire"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Water Resistance</label>
              <input
                name="waterResistance"
                value={formData.waterResistance}
                onChange={handleChange}
                placeholder="300m / 1,000 feet"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Media & Narrative */}
        <div>
          <h2 className="font-display text-base text-[#EDE6D6] mb-4 pb-2 border-b border-[rgba(176,141,87,0.10)]">
            Imagery & Editorial Narrative
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Product Image URL</label>
              <input
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/photo-..."
                className={inputClass}
              />
              {formData.imageUrl && (
                <div className="mt-2 w-24 h-24 rounded-[2px] overflow-hidden border border-[rgba(176,141,87,0.20)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div>
              <label className={labelClass}>Boutique Description *</label>
              <textarea
                required
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed description of the timepiece, provenance, condition, and full box/papers inclusion..."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Craftsmanship Narrative</label>
              <textarea
                rows={2}
                name="craftsmanshipNarrative"
                value={formData.craftsmanshipNarrative}
                onChange={handleChange}
                placeholder="Atelier notes regarding hand-finishing, beveling, or Geneva stripes..."
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="pt-4 border-t border-[rgba(176,141,87,0.10)] flex items-center justify-end gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2 border border-[rgba(176,141,87,0.20)] text-xs font-mono uppercase tracking-wider text-[rgba(237,230,214,0.60)] hover:text-[#EDE6D6] rounded-[2px] transition-colors"
          >
            Cancel
          </Link>
          <Button type="submit" variant="primary" size="md" loading={isSubmitting}>
            <Save className="w-4 h-4 mr-1.5" />
            <span>{isEditing ? 'Save Changes' : 'Create Timepiece'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
