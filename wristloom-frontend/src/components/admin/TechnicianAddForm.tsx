'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/primitives/Button';
import { ArrowLeft, Wrench, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export function TechnicianAddForm() {
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    specializations: 'Rolex Certified, Movement Overhaul, Vintage Restoration',
    yearsExperience: '8',
    bio: 'Wristloom Certified Master Watchmaker specializing in mechanical movements and luxury complications.',
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        specializations: formData.specializations
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        yearsExperience: parseInt(formData.yearsExperience, 10) || 5,
        bio: formData.bio.trim(),
      };

      const res = await fetch('/api/technicians', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to create technician' });
        return;
      }

      setMessage({ type: 'success', text: 'Technician account successfully created with role TECHNICIAN.' });
      setTimeout(() => {
        router.push('/admin/technicians');
        router.refresh();
      }, 1000);
    } catch {
      setMessage({ type: 'error', text: 'Network error creating technician account' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3.5 py-2.5 text-xs text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.30)] focus:border-[#B08D57] focus:outline-none transition-colors';
  const labelClass = 'block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.50)] mb-1.5';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-[rgba(176,141,87,0.15)]">
        <Link
          href="/admin/technicians"
          className="p-2 bg-[#1E1A17] border border-[rgba(176,141,87,0.20)] hover:border-[#B08D57] rounded-[2px] text-[rgba(237,230,214,0.60)] hover:text-[#EDE6D6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] block mb-0.5">
            Atelier Staffing
          </span>
          <h1 className="font-display text-2xl text-[#EDE6D6]">Onboard Master Horologist</h1>
        </div>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-[2px] border text-xs flex items-center gap-2.5 ${
            message.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-red-950/40 border-red-800/60 text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 space-y-5">
        <div className="p-3 bg-[rgba(176,141,87,0.06)] border border-[rgba(176,141,87,0.20)] rounded-[2px] flex items-center gap-2.5 text-xs text-[rgba(237,230,214,0.70)]">
          <ShieldCheck className="w-4 h-4 text-[#B08D57] flex-shrink-0" />
          <span>This will create an authenticated user with backend role <strong className="text-[#B08D57]">TECHNICIAN</strong> and atelier credentials.</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Horologist Full Name *</label>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Laurent Ferrier"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Official Atelier Email *</label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              placeholder="e.g. laurent@wristloom.com"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Direct Phone Number *</label>
            <input
              required
              value={formData.phone}
              onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
              placeholder="+91 98765 43210"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Initial Access Password * (Min 8 chars)</label>
            <input
              required
              type="password"
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
              placeholder="••••••••••••"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Horological Specializations (comma separated)</label>
            <input
              value={formData.specializations}
              onChange={(e) => setFormData((p) => ({ ...p, specializations: e.target.value }))}
              placeholder="Rolex, Tourbillon, Chronograph, Polish"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Years Experience</label>
            <input
              type="number"
              min="1"
              value={formData.yearsExperience}
              onChange={(e) => setFormData((p) => ({ ...p, yearsExperience: e.target.value }))}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Professional Biography</label>
          <textarea
            rows={3}
            value={formData.bio}
            onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
            className={inputClass}
          />
        </div>

        <div className="pt-3 border-t border-[rgba(176,141,87,0.10)] flex items-center justify-end gap-3">
          <Link
            href="/admin/technicians"
            className="px-4 py-2 border border-[rgba(176,141,87,0.20)] text-xs font-mono uppercase tracking-wider text-[rgba(237,230,214,0.60)] hover:text-[#EDE6D6] rounded-[2px]"
          >
            Cancel
          </Link>
          <Button type="submit" variant="primary" size="md" loading={isSubmitting}>
            <Wrench className="w-4 h-4 mr-1.5" />
            <span>Create Technician</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
