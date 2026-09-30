'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/primitives/Button';
import { ArrowLeft, Save, Watch, CheckCircle2, ShieldAlert, Upload, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { WATCH_BRANDS } from '@/lib/constants';

interface ProductFormProps {
  initialData?: {
    id?: string;
    slug?: string;
    name: string;
    modelName?: string | null;
    brand: string;
    referenceNumber?: string | null;
    price: number;
    purchaseValue?: number | null;
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
    isActive?: boolean;
    stockCount?: number;
    stock?: number;
    images?: string[];
    imageUrl?: string | null;
  };
  isEditing?: boolean;
}

const COMMON_MOVEMENTS = [
  'Automatic',
  'Manual Wind',
  'Quartz',
  'Solar',
  'Eco-Drive',
  'Automatic Chronograph',
  'Kinetic',
];

export function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  const router = useRouter();

  const [formData, setFormData] = React.useState({
    brand: initialData?.brand || WATCH_BRANDS[0],
    modelName: initialData?.modelName || initialData?.name || '',
    referenceNumber: initialData?.referenceNumber || '',
    caseSize: initialData?.caseSize || '40.5 mm',
    movementType: initialData?.movementType || 'Automatic',
    purchaseValue: initialData?.purchaseValue ? String(initialData.purchaseValue) : (initialData?.price ? String(initialData.price) : ''),
    stock: initialData?.stock !== undefined ? String(initialData.stock) : (initialData?.stockCount !== undefined ? String(initialData.stockCount) : '5'),
    imageUrl: initialData?.imageUrl || initialData?.images?.[0] || '/watches/seiko-srpb43j1.svg',
    description: initialData?.description || '',
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    condition: initialData?.condition || 'New',
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatusMessage(null);

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setFormData((prev) => ({ ...prev, imageUrl: data.url }));
      setStatusMessage({ type: 'success', text: 'Image uploaded and persisted successfully.' });
    } catch (err: any) {
      console.error('Upload error:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Image upload failed' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const pValue = parseFloat(formData.purchaseValue) || 0;
    const stockVal = parseInt(formData.stock, 10) || 0;

    const payload = {
      brand: formData.brand.trim(),
      modelName: formData.modelName.trim(),
      name: formData.modelName.trim(),
      referenceNumber: String(formData.referenceNumber).trim(),
      caseSize: formData.caseSize.trim(),
      movementType: formData.movementType.trim(),
      purchaseValue: pValue,
      price: pValue,
      stock: stockVal,
      stockCount: stockVal,
      imageUrl: formData.imageUrl.trim() || '/watches/placeholder-watch.svg',
      images: [formData.imageUrl.trim() || '/watches/placeholder-watch.svg'],
      description: formData.description.trim(),
      isActive: Boolean(formData.isActive),
      inStock: stockVal > 0,
      condition: formData.condition,
    };

    try {
      const url = isEditing && initialData?.id ? `/api/products/${initialData.id}` : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';

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
        text: isEditing ? 'Timepiece updated successfully.' : 'Timepiece created successfully in catalog.',
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
              Admin Catalog Management
            </span>
            <h1 className="font-display text-2xl text-[#EDE6D6]">
              {isEditing ? `Edit: ${initialData?.brand} ${initialData?.modelName || initialData?.name}` : 'Add New Watch to Catalog'}
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
        {/* Watch Identity */}
        <div>
          <h2 className="font-display text-base text-[#EDE6D6] mb-4 pb-2 border-b border-[rgba(176,141,87,0.10)] flex items-center gap-2">
            <Watch className="w-4 h-4 text-[#B08D57]" />
            <span>Timepiece Identity</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Brand (12 Authorized Brands) *</label>
              <select
                required
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className={inputClass}
              >
                {WATCH_BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Model Name *</label>
              <input
                required
                name="modelName"
                value={formData.modelName}
                onChange={handleChange}
                placeholder="e.g. Presage Cocktail Time"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Reference Number (String) *</label>
              <input
                required
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleChange}
                placeholder="e.g. SRPB43J1"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Technical Specifications */}
        <div>
          <h2 className="font-display text-base text-[#EDE6D6] mb-4 pb-2 border-b border-[rgba(176,141,87,0.10)]">
            Technical & Dimension Specifications
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Case Size *</label>
              <input
                required
                name="caseSize"
                value={formData.caseSize}
                onChange={handleChange}
                placeholder="e.g. 40.5 mm"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Movement Type *</label>
              <select
                name="movementType"
                value={formData.movementType}
                onChange={handleChange}
                className={inputClass}
              >
                {COMMON_MOVEMENTS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Condition</label>
              <select name="condition" value={formData.condition} onChange={handleChange} className={inputClass}>
                <option value="New">Brand New / Unworn</option>
                <option value="Pre-Owned">Pre-Owned Mint</option>
                <option value="Vintage">Vintage Collector Piece</option>
              </select>
            </div>
          </div>
        </div>

        {/* Valuation & Stock */}
        <div>
          <h2 className="font-display text-base text-[#EDE6D6] mb-4 pb-2 border-b border-[rgba(176,141,87,0.10)]">
            Valuation & Stock
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Purchase Value (INR ₹) *</label>
              <input
                required
                type="number"
                name="purchaseValue"
                value={formData.purchaseValue}
                onChange={handleChange}
                placeholder="e.g. 45000"
                min="1"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Stock Available (Units) *</label>
              <input
                required
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 accent-[#B08D57]"
            />
            <label htmlFor="isActive" className="text-xs text-[rgba(237,230,214,0.70)] select-none">
              Active in Watch Catalog (Visible to customers for purchase)
            </label>
          </div>
        </div>

        {/* Product Image & Upload */}
        <div>
          <h2 className="font-display text-base text-[#EDE6D6] mb-4 pb-2 border-b border-[rgba(176,141,87,0.10)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#B08D57]" />
              <span>Product Image Accuracy</span>
            </div>
            <span className="font-mono text-[10px] text-[#B08D57]">Exact watch reference match</span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
            <div className="sm:col-span-2 space-y-3">
              <div>
                <label className={labelClass}>Image URL or Asset Path</label>
                <input
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="/watches/seiko-srpb43j1.svg or https://..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Or Upload Exact Timepiece Photo</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="subtle"
                    size="sm"
                    loading={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Upload Image File
                  </Button>
                  <span className="text-[11px] text-[rgba(237,230,214,0.40)]">
                    Saved to local storage & persisted to database.
                  </span>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="flex flex-col items-center justify-center p-3 bg-[#14110F] border border-[rgba(176,141,87,0.15)] rounded-[2px] text-center">
              <div className="w-32 h-32 rounded-[2px] overflow-hidden border border-[rgba(176,141,87,0.20)] bg-[#1a1614] flex items-center justify-center mb-2">
                {formData.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/watches/placeholder-watch.svg';
                    }}
                  />
                ) : (
                  <Watch className="w-8 h-8 text-[rgba(176,141,87,0.30)]" />
                )}
              </div>
              <span className="text-[10px] font-mono text-[rgba(237,230,214,0.50)] truncate max-w-[140px]">
                {formData.referenceNumber || 'No Ref Number'}
              </span>
            </div>
          </div>
        </div>

        {/* Narrative & Description */}
        <div>
          <h2 className="font-display text-base text-[#EDE6D6] mb-4 pb-2 border-b border-[rgba(176,141,87,0.10)]">
            Description
          </h2>
          <div>
            <label className={labelClass}>Watch Description *</label>
            <textarea
              required
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of the timepiece, dial finish, movement specifications, and atelier notes..."
              className={inputClass}
            />
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
            <span>{isEditing ? 'Save Changes' : 'Create Watch'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
