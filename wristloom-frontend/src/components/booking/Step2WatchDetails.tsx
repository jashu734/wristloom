'use client';

import * as React from 'react';
import { useBookingStore } from '@/store/bookingStore';
import { Button } from '@/components/primitives/Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, ImageIcon } from 'lucide-react';

const schema = z.object({
  watchBrand: z.string().min(1, 'Brand is required'),
  watchModel: z.string().min(1, 'Model is required'),
  watchReferenceNumber: z.string().optional(),
  issueDescription: z.string().min(10, 'Please describe the issue (min 10 characters)'),
});
type FormData = z.infer<typeof schema>;

const inputClass =
  'w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-4 py-3 text-sm text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.25)] focus:border-[#B08D57] focus:outline-none transition-colors';

export function Step2WatchDetails() {
  const { watchBrand, watchModel, watchReferenceNumber, issueDescription, issueImages,
          setWatchDetails, addIssueImage, setStep } = useBookingStore();

  const [uploading, setUploading] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { watchBrand, watchModel, watchReferenceNumber, issueDescription },
  });

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('bucket', 'repair-photos');
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        if (res.ok) {
          const { url } = await res.json();
          addIssueImage(url);
        }
      }
    } finally {
      setUploading(false);
    }
  }

  function onSubmit(data: FormData) {
    setWatchDetails(data);
    setStep(3);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <span className="text-overline block mb-3">Step 2 of 7</span>
        <h2 className="font-display text-3xl text-[#EDE6D6] mb-2">Watch Details</h2>
        <p className="text-sm text-[rgba(237,230,214,0.55)]">
          Tell us about the timepiece requiring service.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1.5">Brand *</label>
            <input {...register('watchBrand')} placeholder="e.g. Rolex" className={inputClass} />
            {errors.watchBrand && <p className="text-xs text-red-400 mt-1">{errors.watchBrand.message}</p>}
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1.5">Model *</label>
            <input {...register('watchModel')} placeholder="e.g. Submariner Date" className={inputClass} />
            {errors.watchModel && <p className="text-xs text-red-400 mt-1">{errors.watchModel.message}</p>}
          </div>
        </div>

        <div>
          <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1.5">Reference Number</label>
          <input {...register('watchReferenceNumber')} placeholder="e.g. 126610LN" className={inputClass} />
        </div>

        <div>
          <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1.5">Issue Description *</label>
          <textarea
            {...register('issueDescription')}
            rows={4}
            placeholder="Describe the issue in detail — symptoms, when it started, any relevant history..."
            className={inputClass + ' resize-none'}
          />
          {errors.issueDescription && <p className="text-xs text-red-400 mt-1">{errors.issueDescription.message}</p>}
        </div>

        {/* Image upload */}
        <div>
          <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1.5">
            Photos (optional)
          </label>
          <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-[rgba(176,141,87,0.25)] rounded-[2px] p-6 cursor-pointer hover:border-[rgba(176,141,87,0.45)] transition-colors">
            <Upload className="w-5 h-5 text-[rgba(176,141,87,0.50)]" />
            <span className="text-sm text-[rgba(237,230,214,0.45)]">
              {uploading ? 'Uploading...' : 'Click to upload photos'}
            </span>
            <span className="font-mono text-[9px] text-[rgba(237,230,214,0.30)]">JPG, PNG, WEBP up to 10MB</span>
            <input type="file" accept="image/*" multiple className="sr-only" onChange={handleImageUpload} disabled={uploading} />
          </label>

          {issueImages.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-3">
              {issueImages.map((url, i) => (
                <div key={i} className="relative w-16 h-16 rounded-[2px] overflow-hidden border border-[rgba(176,141,87,0.20)]">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" size="lg" onClick={() => setStep(1)} className="flex-1">
            Back
          </Button>
          <Button type="submit" variant="primary" size="lg" className="flex-1">
            Continue to Address
          </Button>
        </div>
      </form>
    </div>
  );
}
