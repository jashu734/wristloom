'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Wrench,
  Star,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  Award,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/primitives/Button';

interface TechnicianDetailClientProps {
  technician: any;
}

export function TechnicianDetailClient({ technician: initialTech }: TechnicianDetailClientProps) {
  const [tech, setTech] = React.useState(initialTech);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const toggleStatus = async (field: 'isAvailable' | 'isVerified') => {
    setIsUpdating(true);
    setMessage(null);

    const nextVal = !tech[field];
    try {
      const res = await fetch(`/api/technicians/${tech.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: nextVal }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      setTech((p: any) => ({ ...p, [field]: nextVal }));
      setMessage({ type: 'success', text: `Technician ${field === 'isAvailable' ? 'availability' : 'verification'} updated.` });
    } catch {
      setMessage({ type: 'error', text: 'Network error updating technician status' });
    } finally {
      setIsUpdating(false);
    }
  };

  const activeBookings = (tech.bookings || []).filter(
    (b: any) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED'
  );
  const completedBookings = (tech.bookings || []).filter((b: any) => b.status === 'COMPLETED');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(176,141,87,0.15)]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/technicians"
            className="p-2 bg-[#1E1A17] border border-[rgba(176,141,87,0.20)] hover:border-[#B08D57] rounded-[2px] text-[rgba(237,230,214,0.60)] hover:text-[#EDE6D6] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#B08D57]">Horologist Profile</span>
              <span className="font-mono text-xs text-[rgba(237,230,214,0.30)]">•</span>
              <span className="font-mono text-xs text-[rgba(237,230,214,0.50)]">
                {tech.yearsExperience} Years Experience
              </span>
            </div>
            <h1 className="font-display text-2xl text-[#EDE6D6]">{tech.user?.name || 'Master Watchmaker'}</h1>
          </div>
        </div>

        {/* Quick Status Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleStatus('isAvailable')}
            disabled={isUpdating}
            className={`px-3 py-1.5 rounded-[2px] text-xs font-mono uppercase tracking-wider border transition-colors ${
              tech.isAvailable
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-950/70'
                : 'bg-red-950/40 border-red-800/60 text-red-300 hover:bg-red-950/70'
            }`}
          >
            {tech.isAvailable ? 'Status: Available' : 'Status: Off-Duty'}
          </button>
          <button
            onClick={() => toggleStatus('isVerified')}
            disabled={isUpdating}
            className={`px-3 py-1.5 rounded-[2px] text-xs font-mono uppercase tracking-wider border transition-colors ${
              tech.isVerified
                ? 'bg-[rgba(176,141,87,0.15)] border-[rgba(176,141,87,0.40)] text-[#B08D57]'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400'
            }`}
          >
            {tech.isVerified ? 'Verified Master' : 'Unverified'}
          </button>
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

      {/* Info Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-4">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[rgba(237,230,214,0.40)] block">
            Client Rating
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <Star className="w-4 h-4 text-[#B08D57] fill-[#B08D57]" />
            <span className="font-display text-xl text-[#EDE6D6]">{tech.rating.toFixed(1)}</span>
            <span className="text-[10px] text-[rgba(237,230,214,0.40)]">/ 5.0</span>
          </div>
        </div>

        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-4">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[rgba(237,230,214,0.40)] block">
            Active Jobs
          </span>
          <p className="font-display text-xl text-amber-400 mt-1">{activeBookings.length}</p>
        </div>

        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-4">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[rgba(237,230,214,0.40)] block">
            Completed Services
          </span>
          <p className="font-display text-xl text-emerald-400 mt-1">{tech.completedServices}</p>
        </div>

        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-4">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[rgba(237,230,214,0.40)] block">
            Service Radius
          </span>
          <p className="font-display text-xl text-[#B08D57] mt-1">{tech.serviceRadiusKm} km</p>
        </div>
      </div>

      {/* Details & Specializations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 space-y-4">
          <h2 className="font-display text-lg text-[#EDE6D6] pb-2 border-b border-[rgba(176,141,87,0.10)]">
            Horological Credentials & Bio
          </h2>
          <p className="text-xs text-[rgba(237,230,214,0.70)] leading-relaxed">
            {tech.bio || 'Wristloom Certified Master Watchmaker.'}
          </p>

          <div>
            <span className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] block mb-2">
              Atelier Specializations
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(tech.specializations || []).map((s: string) => (
                <span
                  key={s}
                  className="px-2.5 py-1 bg-[#14110F] border border-[rgba(176,141,87,0.20)] text-[#B08D57] text-[11px] font-mono rounded-[1px]"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 space-y-3">
          <h2 className="font-display text-base text-[#EDE6D6] pb-2 border-b border-[rgba(176,141,87,0.10)]">
            Contact Channels
          </h2>
          <div className="space-y-2 text-xs">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[rgba(237,230,214,0.40)] block">
                Email
              </span>
              <p className="font-mono text-[#EDE6D6]">{tech.user?.email}</p>
            </div>
            <div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[rgba(237,230,214,0.40)] block">
                Direct Mobile
              </span>
              <p className="font-mono text-[#EDE6D6]">{tech.user?.phone || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Service Bookings */}
      <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(176,141,87,0.10)]">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-[#B08D57]" />
            <h2 className="font-display text-lg text-[#EDE6D6]">Assigned Service Jobs ({tech.bookings?.length || 0})</h2>
          </div>
        </div>

        {(!tech.bookings || tech.bookings.length === 0) ? (
          <p className="text-center text-xs font-mono text-[rgba(237,230,214,0.40)] py-8">
            No service jobs currently assigned to this horologist.
          </p>
        ) : (
          <div className="divide-y divide-[rgba(176,141,87,0.08)]">
            {tech.bookings.map((b: any) => (
              <div key={b.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#EDE6D6]">#{b.bookingReference}</span>
                    <span className="px-2 py-0.5 text-[9px] font-mono rounded-[1px] bg-[rgba(176,141,87,0.10)] text-[#B08D57] border border-[rgba(176,141,87,0.20)]">
                      {b.status}
                    </span>
                  </div>
                  <p className="text-xs text-[rgba(237,230,214,0.60)] mt-0.5">
                    {b.watchBrand || 'Horology'} — {b.serviceType}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-[rgba(237,230,214,0.40)]">
                    {new Date(b.scheduledDate).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/admin/service-bookings/${b.id}`}
                    className="px-2.5 py-1 bg-[#14110F] border border-[rgba(176,141,87,0.20)] hover:border-[#B08D57] text-[10px] font-mono uppercase text-[#EDE6D6] rounded-[2px]"
                  >
                    View Job →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
