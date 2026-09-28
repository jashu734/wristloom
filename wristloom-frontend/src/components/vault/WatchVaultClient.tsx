'use client';

import * as React from 'react';
import { MOCK_VAULT_ITEMS } from '@/lib/mock-data';
import type { VaultItem } from '@/lib/types';
import { HealthBadge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { EmptyState } from '@/components/primitives/States';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
  Plus,
  Archive,
  Clock,
  FileText,
  Camera,
  ChevronDown,
  ChevronUp,
  Wrench,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

// ─── Watch Vault Client ───────────────────────────────────────
export function WatchVaultClient() {
  const [items, setItems] = React.useState<VaultItem[]>(MOCK_VAULT_ITEMS);
  const [selected, setSelected] = React.useState<string | null>(MOCK_VAULT_ITEMS[0]?.id ?? null);
  const [isAuthenticated] = React.useState(true); // Simulated auth
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  // New watch form state
  const [newWatch, setNewWatch] = React.useState({
    brand: 'Rolex',
    watch_name: '',
    reference_number: '',
    movement: 'Automatic',
    case_size: '40mm',
    health_status: 'Excellent' as VaultItem['health_status'],
    purchase_price: '',
  });

  const selectedItem = items.find((i) => i.id === selected);

  function handleAddWatch(e: React.FormEvent) {
    e.preventDefault();
    if (!newWatch.watch_name.trim()) return;

    const newItem: VaultItem = {
      id: `vault_${Date.now()}`,
      owner_id: 'user_vault',
      brand: newWatch.brand,
      watch_name: newWatch.watch_name,
      reference_number: newWatch.reference_number || 'REF-TBD',
      movement: newWatch.movement,
      case_size: newWatch.case_size,
      health_status: newWatch.health_status,
      purchase_price: newWatch.purchase_price ? parseFloat(newWatch.purchase_price) : undefined,
      photo_urls: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      ],
      document_urls: [],
      service_history: [],
      created_at: new Date().toISOString(),
    };

    setItems((prev) => [newItem, ...prev]);
    setSelected(newItem.id);
    setIsAddModalOpen(false);
    setNewWatch({
      brand: 'Rolex',
      watch_name: '',
      reference_number: '',
      movement: 'Automatic',
      case_size: '40mm',
      health_status: 'Excellent',
      purchase_price: '',
    });
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <div className="w-16 h-16 rounded-full border border-[rgba(176,141,87,0.30)] flex items-center justify-center mx-auto mb-6">
            <Archive className="w-7 h-7 text-[#B08D57]" />
          </div>
          <h1 className="font-display text-2xl text-[#EDE6D6] mb-3">Your Watch Vault</h1>
          <p className="text-sm text-[rgba(237,230,214,0.55)] mb-6">
            Sign in to access your personal collection manager.
          </p>
          <Button variant="primary" asChild>
            <Link href="/account">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#14110F]">
      {/* ─── Vault Header ──────────────────────────────── */}
      <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
        <div className="container-wl py-8">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-overline block mb-2">Your Collection</span>
              <h1 className="font-display text-3xl md:text-4xl text-[#EDE6D6] tracking-tight">
                Watch Vault
              </h1>
              <p className="text-sm text-[rgba(237,230,214,0.50)] mt-1">
                {items.length} {items.length === 1 ? 'timepiece' : 'timepieces'} · Personal collection
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Watch
            </Button>
          </div>

          {/* Collection health summary */}
          <div className="mt-6 flex flex-wrap gap-4">
            {(['Excellent', 'Service Recommended', 'Service Due'] as const).map((status) => {
              const count = items.filter((i) => i.health_status === status).length;
              if (count === 0) return null;
              return (
                <div key={status} className="flex items-center gap-2">
                  <HealthBadge status={status} />
                  <span className="font-mono text-[10px] text-[rgba(237,230,214,0.35)]">×{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Add Watch Modal ────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.30)] rounded-[2px] p-6 max-w-lg w-full shadow-2xl relative">
            <h2 className="font-display text-2xl text-[#EDE6D6] mb-1">Add to Watch Vault</h2>
            <p className="text-xs text-[rgba(237,230,214,0.50)] mb-6">
              Register a new timepiece into your secure horological ledger.
            </p>

            <form onSubmit={handleAddWatch} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={newWatch.brand}
                    onChange={(e) => setNewWatch({ ...newWatch, brand: e.target.value })}
                    className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3 py-2 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1">
                    Model Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Submariner Date"
                    value={newWatch.watch_name}
                    onChange={(e) => setNewWatch({ ...newWatch, watch_name: e.target.value })}
                    className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3 py-2 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 126610LN"
                    value={newWatch.reference_number}
                    onChange={(e) => setNewWatch({ ...newWatch, reference_number: e.target.value })}
                    className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3 py-2 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1">
                    Case Size
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 40mm"
                    value={newWatch.case_size}
                    onChange={(e) => setNewWatch({ ...newWatch, case_size: e.target.value })}
                    className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3 py-2 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1">
                    Movement
                  </label>
                  <select
                    value={newWatch.movement}
                    onChange={(e) => setNewWatch({ ...newWatch, movement: e.target.value })}
                    className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3 py-2 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual Wind</option>
                    <option value="Quartz">Quartz</option>
                    <option value="Spring Drive">Spring Drive</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1">
                    Purchase Value (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 850000"
                    value={newWatch.purchase_price}
                    onChange={(e) => setNewWatch({ ...newWatch, purchase_price: e.target.value })}
                    className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3 py-2 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[rgba(176,141,87,0.15)]">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Save to Vault
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Vault Layout ──────────────────────────────── */}
      <div className="container-wl py-8">
        {items.length === 0 ? (
          <EmptyState
            icon={<Archive className="w-10 h-10" />}
            title="Your vault is empty"
            description="Add your first timepiece to begin tracking its health, service history, and ownership documents."
            action={
              <Button variant="primary">
                <Plus className="w-4 h-4" /> Add Your First Watch
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">

            {/* ─── Vault List ──────────────────────────── */}
            <aside>
              <h2 className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] mb-3">
                Collection
              </h2>
              <div className="space-y-2">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item.id)}
                    className={`w-full text-left flex items-center gap-4 p-3 rounded-[2px] border transition-all ${
                      selected === item.id
                        ? 'border-[#B08D57] bg-[rgba(176,141,87,0.08)]'
                        : 'border-[rgba(176,141,87,0.10)] bg-[#1E1A17] hover:border-[rgba(176,141,87,0.25)]'
                    }`}
                    aria-pressed={selected === item.id}
                  >
                    {/* Thumbnail */}
                    <div className="w-14 h-14 flex-shrink-0 rounded-[2px] overflow-hidden bg-[#14110F]">
                      {item.photo_urls[0] ? (
                        <img
                          src={item.photo_urls[0]}
                          alt={item.watch_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Archive className="w-5 h-5 text-[rgba(176,141,87,0.30)]" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] mb-0.5">
                        {item.brand}
                      </p>
                      <p className="text-sm text-[#EDE6D6] truncate">{item.watch_name}</p>
                      <div className="mt-1">
                        <HealthBadge status={item.health_status} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </aside>

            {/* ─── Watch Detail Panel ───────────────────── */}
            {selectedItem && (
              <WatchDetailPanel item={selectedItem} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Watch Detail Panel ───────────────────────────────────────
function WatchDetailPanel({ item }: { item: VaultItem }) {
  const [historyExpanded, setHistoryExpanded] = React.useState(false);

  return (
    <div className="space-y-5">

      {/* Header card */}
      <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] overflow-hidden relative">
        {/* Thread motif background — approved location */}
        <div className="thread-motif opacity-[0.04] rounded-[2px]" aria-hidden />

        <div className="relative z-10 p-6 flex flex-col sm:flex-row gap-6">
          {/* Watch image */}
          <div className="w-full sm:w-48 flex-shrink-0 aspect-square rounded-[2px] overflow-hidden bg-[#14110F]">
            {item.photo_urls[0] ? (
              <img
                src={item.photo_urls[0]}
                alt={item.watch_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Archive className="w-12 h-12 text-[rgba(176,141,87,0.20)]" />
              </div>
            )}
          </div>

          {/* Watch info */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] mb-1">
                  {item.brand}
                </p>
                <h2 className="font-display text-2xl text-[#EDE6D6]">{item.watch_name}</h2>
              </div>
              <HealthBadge status={item.health_status} />
            </div>

            {/* Specs grid in mono */}
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
              {[
                { label: 'Reference', value: item.reference_number },
                { label: 'Movement', value: item.movement },
                { label: 'Case Size', value: item.case_size },
                ...(item.serial_number ? [{ label: 'Serial', value: item.serial_number }] : []),
                ...(item.year_of_manufacture ? [{ label: 'Year', value: String(item.year_of_manufacture) }] : []),
                ...(item.purchase_date ? [{ label: 'Acquired', value: formatDate(item.purchase_date, { month: 'short', year: 'numeric', day: undefined }) }] : []),
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] mb-0.5">
                    {label}
                  </dt>
                  <dd className="font-mono text-[11px] text-[rgba(237,230,214,0.70)]">{value}</dd>
                </div>
              ))}
            </dl>

            {/* Purchase value */}
            {item.purchase_price && (
              <div className="mt-4 pt-4 border-t border-[rgba(176,141,87,0.08)]">
                <span className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.35)]">
                  Purchase Value
                </span>
                <p className="font-mono text-sm text-[#B08D57] mt-0.5">
                  {formatCurrency(item.purchase_price)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Last service */}
        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-[rgba(176,141,87,0.50)]" />
            <span className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)]">
              Last Serviced
            </span>
          </div>
          <p className="font-mono text-sm text-[#EDE6D6]">
            {item.last_service_date ? formatDate(item.last_service_date) : 'Never recorded'}
          </p>
        </div>

        {/* Service due */}
        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-[rgba(176,141,87,0.50)]" />
            <span className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)]">
              Service Due
            </span>
          </div>
          <p className="font-mono text-sm text-[#EDE6D6]">
            {item.service_due_date ? formatDate(item.service_due_date) : 'Not set'}
          </p>
        </div>

        {/* Book service */}
        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-4 flex flex-col justify-between">
          <p className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] mb-3">
            Book a Service
          </p>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/services/repair">
              <Wrench className="w-3.5 h-3.5" />
              Schedule
            </Link>
          </Button>
        </div>
      </div>

      {/* Notes */}
      {item.notes && (
        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-5">
          <h3 className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] mb-2">
            Notes
          </h3>
          <p className="text-sm text-[rgba(237,230,214,0.60)] leading-relaxed">{item.notes}</p>
        </div>
      )}

      {/* Service History Timeline */}
      <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px]">
        <button
          className="w-full flex items-center justify-between p-5 text-left"
          onClick={() => setHistoryExpanded(!historyExpanded)}
          aria-expanded={historyExpanded}
        >
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4 text-[rgba(176,141,87,0.50)]" />
            <h3 className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.55)]">
              Service History
            </h3>
            {item.service_history.length > 0 && (
              <span className="font-mono text-[10px] text-[#B08D57] bg-[rgba(176,141,87,0.10)] border border-[rgba(176,141,87,0.20)] px-2 py-0.5 rounded-[1px]">
                {item.service_history.length}
              </span>
            )}
          </div>
          {historyExpanded ? (
            <ChevronUp className="w-4 h-4 text-[rgba(237,230,214,0.40)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[rgba(237,230,214,0.40)]" />
          )}
        </button>

        {historyExpanded && (
          <div className="px-5 pb-5">
            {item.service_history.length === 0 ? (
              <p className="text-sm text-[rgba(237,230,214,0.40)] italic">
                No service records yet. Book a service to begin your history.
              </p>
            ) : (
              <div className="relative">
                {/* Thread spine — approved location */}
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[rgba(176,141,87,0.20)]" aria-hidden />

                <div className="space-y-6 pl-7">
                  {item.service_history.map((entry) => (
                    <div key={entry.id} className="relative">
                      {/* Node */}
                      <div className="absolute -left-7 top-1 w-3.5 h-3.5 rounded-full border border-[#B08D57] bg-[#1E1A17] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#B08D57]" />
                      </div>

                      <p className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] mb-1">
                        {formatDate(entry.date)}
                      </p>
                      <p className="text-sm font-medium text-[#EDE6D6] mb-1">{entry.service_type}</p>
                      <p className="text-xs text-[rgba(237,230,214,0.50)] leading-relaxed mb-2">
                        {entry.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.35)]">
                          By {entry.technician_name}
                        </span>
                        {entry.cost && (
                          <span className="font-mono text-[10px] text-[rgba(237,230,214,0.35)]">
                            {formatCurrency(entry.cost)}
                          </span>
                        )}
                        {entry.warranty_until && (
                          <span className="font-mono text-[10px] text-emerald-400/70">
                            Warranty until {formatDate(entry.warranty_until, { month: 'short', year: 'numeric', day: undefined })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Document / Photo upload functional buttons */}
      <div className="grid grid-cols-2 gap-4">
        <label className="bg-[#1E1A17] border border-dashed border-[rgba(176,141,87,0.20)] rounded-[2px] p-5 flex flex-col items-center gap-2 hover:border-[rgba(176,141,87,0.40)] transition-colors group cursor-pointer">
          <Camera className="w-5 h-5 text-[rgba(176,141,87,0.40)] group-hover:text-[#B08D57] transition-colors" />
          <span className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.60)] group-hover:text-[#EDE6D6]">
            Add Photos
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                alert(`Photo "${file.name}" uploaded to ${item.watch_name} vault records.`);
              }
            }}
          />
        </label>
        <label className="bg-[#1E1A17] border border-dashed border-[rgba(176,141,87,0.20)] rounded-[2px] p-5 flex flex-col items-center gap-2 hover:border-[rgba(176,141,87,0.40)] transition-colors group cursor-pointer">
          <FileText className="w-5 h-5 text-[rgba(176,141,87,0.40)] group-hover:text-[#B08D57] transition-colors" />
          <span className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.60)] group-hover:text-[#EDE6D6]">
            Upload Documents
          </span>
          <input
            type="file"
            accept=".pdf,.doc,.docx,image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                alert(`Document "${file.name}" saved to digital provenance certificate ledger.`);
              }
            }}
          />
        </label>
      </div>
    </div>
  );
}
