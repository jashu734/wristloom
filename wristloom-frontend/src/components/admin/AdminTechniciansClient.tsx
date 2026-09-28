'use client';

import * as React from 'react';
import { Star, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';

interface TechItem {
  id: string;
  user: {
    name: string | null;
    email: string;
    phone: string | null;
    profileImage: string | null;
  };
  specializations: string[];
  yearsExperience: number;
  completedServices: number;
  rating: number;
  isAvailable: boolean;
  isVerified: boolean;
  activeJobs: number;
}

export function AdminTechniciansClient({ initialTechnicians }: { initialTechnicians: TechItem[] }) {
  const [techs, setTechs] = React.useState<TechItem[]>(initialTechnicians);
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  async function toggleStatus(id: string, field: 'isAvailable' | 'isVerified', currentValue: boolean) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/technicians/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !currentValue }),
      });

      if (res.ok) {
        setTechs((prev) =>
          prev.map((t) => (t.id === id ? { ...t, [field]: !currentValue } : t))
        );
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {techs.map((t) => (
        <div key={t.id} className="bg-[#1E1A17] border border-[rgba(176,141,87,0.12)] rounded-[2px] p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display text-lg text-[#EDE6D6]">{t.user.name || 'Master Watchmaker'}</h3>
              <p className="text-xs text-[rgba(237,230,214,0.45)]">{t.user.email}</p>
              <p className="font-mono text-[11px] text-[#B08D57] mt-0.5">{t.user.phone || '—'}</p>
            </div>
            <div className="flex items-center gap-1 font-mono text-sm text-[#B08D57]">
              <Star className="w-3.5 h-3.5 fill-[#B08D57] text-[#B08D57]" />
              {t.rating.toFixed(2)}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {t.specializations.map((s) => (
              <span key={s} className="font-mono text-[9px] tracking-wider uppercase text-[rgba(237,230,214,0.50)] bg-[rgba(176,141,87,0.08)] border border-[rgba(176,141,87,0.15)] px-2 py-0.5 rounded-[1px]">
                {s}
              </span>
            ))}
          </div>

          <div className="pt-3 border-t border-[rgba(176,141,87,0.08)] grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="font-mono text-xs text-[#EDE6D6]">{t.yearsExperience}y</span>
              <p className="font-mono text-[8px] uppercase tracking-widest text-[rgba(237,230,214,0.30)]">Experience</p>
            </div>
            <div>
              <span className="font-mono text-xs text-[#EDE6D6]">{t.completedServices}</span>
              <p className="font-mono text-[8px] uppercase tracking-widest text-[rgba(237,230,214,0.30)]">Completed</p>
            </div>
            <div>
              <span className={`font-mono text-xs ${t.activeJobs > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{t.activeJobs}</span>
              <p className="font-mono text-[8px] uppercase tracking-widest text-[rgba(237,230,214,0.30)]">Active Jobs</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[rgba(176,141,87,0.08)]">
            <button
              type="button"
              disabled={loadingId === t.id}
              onClick={() => toggleStatus(t.id, 'isAvailable', t.isAvailable)}
              className={`font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-[1px] border transition-colors flex items-center gap-1.5 cursor-pointer ${
                t.isAvailable
                  ? 'text-emerald-400 border-emerald-800/40 bg-emerald-950/20 hover:bg-emerald-950/40'
                  : 'text-[rgba(237,230,214,0.35)] border-[rgba(237,230,214,0.15)] bg-[rgba(20,17,15,0.40)] hover:text-[#EDE6D6]'
              }`}
            >
              {loadingId === t.id && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
              {t.isAvailable ? 'Available' : 'Offline'}
            </button>

            <button
              type="button"
              disabled={loadingId === t.id}
              onClick={() => toggleStatus(t.id, 'isVerified', t.isVerified)}
              className={`font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-[1px] border transition-colors flex items-center gap-1 cursor-pointer ${
                t.isVerified
                  ? 'text-emerald-400/90 border-emerald-800/30 bg-emerald-950/10 hover:bg-emerald-950/30'
                  : 'text-amber-400 border-amber-800/40 bg-amber-950/20 hover:bg-amber-950/40'
              }`}
            >
              {t.isVerified ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Unverified
                </>
              )}
            </button>
          </div>
        </div>
      ))}
      {techs.length === 0 && (
        <div className="col-span-full py-12 text-center text-sm text-[rgba(237,230,214,0.40)] italic">
          No technicians currently registered on the roster.
        </div>
      )}
    </div>
  );
}
