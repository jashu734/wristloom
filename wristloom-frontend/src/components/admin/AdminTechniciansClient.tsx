'use client';

import * as React from 'react';
import { Star, ShieldCheck, ShieldAlert, Loader2, Edit2, X } from 'lucide-react';

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

  // Edit Technician State
  const [editingTech, setEditingTech] = React.useState<TechItem | null>(null);
  const [editForm, setEditForm] = React.useState({
    name: '',
    phone: '',
    specializations: '',
    yearsExperience: '5',
    isAvailable: true,
    isVerified: true,
  });
  const [isEditingSubmitting, setIsEditingSubmitting] = React.useState(false);
  const [editError, setEditError] = React.useState<string | null>(null);

  function openEdit(tech: TechItem) {
    setEditingTech(tech);
    setEditForm({
      name: tech.user.name || '',
      phone: tech.user.phone || '',
      specializations: tech.specializations.join(', '),
      yearsExperience: String(tech.yearsExperience),
      isAvailable: tech.isAvailable,
      isVerified: tech.isVerified,
    });
    setEditError(null);
  }

  async function handleUpdateTechnician(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTech) return;
    setIsEditingSubmitting(true);
    setEditError(null);
    try {
      const payload = {
        name: editForm.name,
        phone: editForm.phone,
        specializations: editForm.specializations.split(',').map((s) => s.trim()).filter(Boolean),
        yearsExperience: Number(editForm.yearsExperience) || 0,
        isAvailable: editForm.isAvailable,
        isVerified: editForm.isVerified,
      };

      const res = await fetch(`/api/technicians/${editingTech.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const updated = await res.json();
      if (!res.ok) {
        throw new Error(updated.error || 'Failed to update technician');
      }

      setTechs((prev) =>
        prev.map((t) =>
          t.id === editingTech.id
            ? {
                ...t,
                user: {
                  ...t.user,
                  name: updated.user?.name ?? payload.name,
                  phone: updated.user?.phone ?? payload.phone,
                },
                specializations: updated.specializations ?? payload.specializations,
                yearsExperience: updated.yearsExperience ?? payload.yearsExperience,
                isAvailable: updated.isAvailable,
                isVerified: updated.isVerified,
              }
            : t
        )
      );
      setEditingTech(null);
    } catch (err: any) {
      setEditError(err.message || 'Failed to update technician');
    } finally {
      setIsEditingSubmitting(false);
    }
  }

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

  const [isAdding, setIsAdding] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [newTechForm, setNewTechForm] = React.useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    specializations: 'Rolex Certified, Movement Overhauls',
    yearsExperience: '8',
  });

  async function handleCreateTechnician(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: newTechForm.name,
        email: newTechForm.email,
        phone: newTechForm.phone,
        password: newTechForm.password,
        specializations: newTechForm.specializations.split(',').map((s) => s.trim()).filter(Boolean),
        yearsExperience: Number(newTechForm.yearsExperience) || 5,
      };

      const res = await fetch('/api/technicians', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to create technician');
      }

      setTechs((prev) => [
        {
          id: data.technician.id,
          user: data.user,
          specializations: data.technician.specializations,
          yearsExperience: data.technician.yearsExperience,
          completedServices: 0,
          rating: 5.0,
          isAvailable: true,
          isVerified: true,
          activeJobs: 0,
        },
        ...prev,
      ]);
      setIsAdding(false);
      setNewTechForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        specializations: 'Rolex Certified, Movement Overhauls',
        yearsExperience: '8',
      });
    } catch (err: any) {
      alert(err.message || 'Error onboarding technician');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setIsAdding(true)}
          className="font-mono text-[10px] tracking-widest uppercase px-4 py-2 bg-[#B08D57] hover:bg-[#C5A059] text-[#0E0C0A] font-semibold rounded-[2px] transition-colors"
        >
          + Onboard Master Horologist
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.25)] rounded-[2px] max-w-md w-full p-6 shadow-2xl">
            <h2 className="font-display text-xl text-[#EDE6D6] mb-4">Onboard Master Watchmaker</h2>
            <form onSubmit={handleCreateTechnician} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#B08D57] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Rathore"
                  value={newTechForm.name}
                  onChange={(e) => setNewTechForm({ ...newTechForm, name: e.target.value })}
                  className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.15)] rounded px-3 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#B08D57] mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="horologist@wristloom.com"
                  value={newTechForm.email}
                  onChange={(e) => setNewTechForm({ ...newTechForm, email: e.target.value })}
                  className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.15)] rounded px-3 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-[#B08D57] mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 00000"
                    value={newTechForm.phone}
                    onChange={(e) => setNewTechForm({ ...newTechForm, phone: e.target.value })}
                    className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.15)] rounded px-3 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-[#B08D57] mb-1">Temporary Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 8 characters"
                    value={newTechForm.password}
                    onChange={(e) => setNewTechForm({ ...newTechForm, password: e.target.value })}
                    className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.15)] rounded px-3 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-[#B08D57] mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    required
                    value={newTechForm.yearsExperience}
                    onChange={(e) => setNewTechForm({ ...newTechForm, yearsExperience: e.target.value })}
                    className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.15)] rounded px-3 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-[#B08D57] mb-1">Specializations</label>
                  <input
                    type="text"
                    placeholder="Rolex, Tourbillons"
                    value={newTechForm.specializations}
                    onChange={(e) => setNewTechForm({ ...newTechForm, specializations: e.target.value })}
                    className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.15)] rounded px-3 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[rgba(176,141,87,0.10)] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 text-[rgba(237,230,214,0.50)] hover:text-[#EDE6D6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="font-mono text-[10px] uppercase tracking-widest px-4 py-2 bg-[#B08D57] text-[#0E0C0A] font-semibold rounded disabled:opacity-50"
                >
                  {isSubmitting ? 'Onboarding...' : 'Confirm & Onboard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Technician Modal */}
      {editingTech && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.30)] rounded-[2px] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(176,141,87,0.15)]">
              <h2 className="font-display text-lg text-[#EDE6D6]">Edit Master Technician</h2>
              <button onClick={() => setEditingTech(null)} className="text-[rgba(237,230,214,0.40)] hover:text-[#EDE6D6]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-red-950/40 border border-red-800/50 rounded text-red-300 text-xs font-mono">
                {editError}
              </div>
            )}

            <form onSubmit={handleUpdateTechnician} className="space-y-3">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-[rgba(237,230,214,0.50)] block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] text-[#EDE6D6] px-3 py-2 text-sm rounded focus:border-[#B08D57] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-[rgba(237,230,214,0.50)] block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] text-[#EDE6D6] px-3 py-2 text-sm rounded focus:border-[#B08D57] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-[rgba(237,230,214,0.50)] block mb-1">
                  Specializations (comma separated)
                </label>
                <input
                  type="text"
                  value={editForm.specializations}
                  onChange={(e) => setEditForm({ ...editForm, specializations: e.target.value })}
                  className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] text-[#EDE6D6] px-3 py-2 text-sm rounded focus:border-[#B08D57] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-[rgba(237,230,214,0.50)] block mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={editForm.yearsExperience}
                  onChange={(e) => setEditForm({ ...editForm, yearsExperience: e.target.value })}
                  className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] text-[#EDE6D6] px-3 py-2 text-sm rounded focus:border-[#B08D57] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 text-xs font-mono text-[#EDE6D6] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isAvailable}
                    onChange={(e) => setEditForm({ ...editForm, isAvailable: e.target.checked })}
                    className="accent-[#B08D57]"
                  />
                  <span>Available</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-mono text-[#EDE6D6] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isVerified}
                    onChange={(e) => setEditForm({ ...editForm, isVerified: e.target.checked })}
                    className="accent-[#B08D57]"
                  />
                  <span>Verified</span>
                </label>
              </div>

              <div className="pt-3 border-t border-[rgba(176,141,87,0.10)] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTech(null)}
                  className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 text-[rgba(237,230,214,0.50)] hover:text-[#EDE6D6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditingSubmitting}
                  className="font-mono text-[10px] uppercase tracking-widest px-4 py-2 bg-[#B08D57] text-[#0E0C0A] font-semibold rounded disabled:opacity-50"
                >
                  {isEditingSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {techs.map((t) => (
        <div key={t.id} className="bg-[#1E1A17] border border-[rgba(176,141,87,0.12)] rounded-[2px] p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display text-lg text-[#EDE6D6]">{t.user.name || 'Master Watchmaker'}</h3>
              <p className="text-xs text-[rgba(237,230,214,0.45)]">{t.user.email}</p>
              <p className="font-mono text-[11px] text-[#B08D57] mt-0.5">{t.user.phone || '—'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openEdit(t)}
                className="p-1.5 text-[rgba(237,230,214,0.40)] hover:text-[#B08D57] transition-colors rounded hover:bg-[rgba(176,141,87,0.10)]"
                title="Edit technician details"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-1 font-mono text-sm text-[#B08D57]">
                <Star className="w-3.5 h-3.5 fill-[#B08D57] text-[#B08D57]" />
                {t.rating.toFixed(2)}
              </div>
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
              onClick={() => openEdit(t)}
              className="font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-[1px] border border-[rgba(176,141,87,0.25)] text-[#B08D57] hover:bg-[rgba(176,141,87,0.10)] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-2.5 h-2.5" />
              <span>Edit</span>
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
    </div>
  );
}
