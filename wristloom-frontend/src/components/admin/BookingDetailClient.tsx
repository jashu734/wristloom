'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Wrench,
  User,
  MapPin,
  Calendar,
  Clock,
  Watch,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/primitives/Button';

interface BookingDetailClientProps {
  booking: any;
  availableTechnicians: Array<{
    id: string;
    name: string;
    specializations: string[];
    rating: number;
    activeJobs: number;
    isAvailable: boolean;
    distanceKm?: number | null;
    isBrandSpecialist?: boolean;
    isRecommended?: boolean;
  }>;
}

const STATUS_WORKFLOW = [
  'PENDING',
  'CONFIRMED',
  'TECHNICIAN_ASSIGNED',
  'TECHNICIAN_EN_ROUTE',
  'TECHNICIAN_ARRIVED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
];

export function BookingDetailClient({
  booking: initialBooking,
  availableTechnicians,
}: BookingDetailClientProps) {
  const router = useRouter();
  const [booking, setBooking] = React.useState(initialBooking);
  const [selectedTechId, setSelectedTechId] = React.useState<string>(initialBooking.technicianId || '');
  const [currentStatus, setCurrentStatus] = React.useState<string>(initialBooking.status);
  const [finalPrice, setFinalPrice] = React.useState<number>(initialBooking.finalPrice ?? initialBooking.estimatedPrice ?? 8500);
  const [paymentStatus, setPaymentStatus] = React.useState<string>(initialBooking.paymentStatus || 'UNPAID');
  const [serviceNote, setServiceNote] = React.useState<string>(initialBooking.notes || '');

  const [isAssigning, setIsAssigning] = React.useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAssignTechnician = async () => {
    if (!selectedTechId) return;
    setIsAssigning(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          technicianId: selectedTechId,
          status: 'TECHNICIAN_ASSIGNED',
        }),
      });

      const updated = await res.json();
      if (!res.ok) {
        throw new Error(updated.error || 'Failed to assign technician');
      }

      setBooking(updated);
      setCurrentStatus('TECHNICIAN_ASSIGNED');
      setMessage({ type: 'success', text: 'Technician successfully assigned to service booking.' });
      router.refresh();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message ?? 'Assignment error' });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUpdateStatus = async () => {
    setIsUpdatingStatus(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: currentStatus,
          finalPrice: Number(finalPrice),
          paymentStatus,
          notes: serviceNote.trim() || undefined,
          stageNote: serviceNote.trim() ? serviceNote.trim() : undefined,
        }),
      });

      const updated = await res.json();
      if (!res.ok) {
        throw new Error(updated.error || 'Failed to update status');
      }

      setBooking(updated);
      setMessage({ type: 'success', text: `Service workflow & milestones updated. Customer notified.` });
      router.refresh();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message ?? 'Status update error' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(176,141,87,0.15)]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/service-bookings"
            className="p-2 bg-[#1E1A17] border border-[rgba(176,141,87,0.20)] hover:border-[#B08D57] rounded-[2px] text-[rgba(237,230,214,0.60)] hover:text-[#EDE6D6] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#B08D57]">Service Dossier</span>
              <span className="font-mono text-xs text-[rgba(237,230,214,0.30)]">•</span>
              <span className="font-mono text-xs text-[rgba(237,230,214,0.50)]">#{booking.bookingReference}</span>
            </div>
            <h1 className="font-display text-2xl text-[#EDE6D6]">
              {booking.watchBrand || 'Horology'} — {booking.serviceType}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/service-tracking/${booking.id}`}
            target="_blank"
            className="px-3.5 py-1.5 bg-[#1E1A17] border border-[rgba(176,141,87,0.20)] hover:border-[#B08D57] text-xs font-mono uppercase tracking-wider text-[rgba(237,230,214,0.70)] hover:text-[#EDE6D6] rounded-[2px] transition-colors flex items-center gap-1.5"
          >
            <span>Live GPS Radar</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
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

      {/* Info Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer & Location */}
        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-5 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[rgba(176,141,87,0.10)]">
            <User className="w-4 h-4 text-[#B08D57]" />
            <h2 className="font-display text-base text-[#EDE6D6]">Customer & Dispatch</h2>
          </div>
          <div className="space-y-1.5 text-xs text-[rgba(237,230,214,0.80)]">
            <p className="font-medium text-[#EDE6D6]">{booking.customer?.name || 'Client'}</p>
            <p className="font-mono text-[11px] text-[rgba(237,230,214,0.50)]">{booking.customer?.email}</p>
            <p className="font-mono text-[11px] text-[rgba(237,230,214,0.50)]">{booking.customer?.phone || '—'}</p>
            <div className="pt-2 border-t border-[rgba(176,141,87,0.06)] flex items-start gap-1.5 text-[rgba(237,230,214,0.60)]">
              <MapPin className="w-3.5 h-3.5 text-[#B08D57] flex-shrink-0 mt-0.5" />
              <span>{booking.address?.formattedAddress || booking.address?.city || 'Doorstep Concierge Location'}</span>
            </div>
          </div>
        </div>

        {/* Watch & Service Details */}
        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-5 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[rgba(176,141,87,0.10)]">
            <Watch className="w-4 h-4 text-[#B08D57]" />
            <h2 className="font-display text-base text-[#EDE6D6]">Watch Specs</h2>
          </div>
          <div className="space-y-1 text-xs">
            <p className="text-sm font-medium text-[#EDE6D6]">
              {booking.watchBrand || 'Horology Piece'} {booking.watchModel || ''}
            </p>
            {booking.watchReferenceNumber && (
              <p className="font-mono text-[10px] text-[rgba(237,230,214,0.40)]">Ref: {booking.watchReferenceNumber}</p>
            )}
            <p className="font-mono text-xs text-[#B08D57] pt-1">Service: {booking.serviceType}</p>
            {booking.issueDescription && (
              <p className="text-[11px] text-[rgba(237,230,214,0.60)] italic pt-1 leading-relaxed">
                &ldquo;{booking.issueDescription}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Schedule & Financials */}
        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-5 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[rgba(176,141,87,0.10)]">
            <CreditCard className="w-4 h-4 text-[#B08D57]" />
            <h2 className="font-display text-base text-[#EDE6D6]">Schedule & Deposit</h2>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[rgba(237,230,214,0.80)]">
              <Calendar className="w-3.5 h-3.5 text-[#B08D57]" />
              <span>{new Date(booking.scheduledDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2 text-[rgba(237,230,214,0.60)]">
              <Clock className="w-3.5 h-3.5 text-[rgba(176,141,87,0.60)]" />
              <span>Slot: {booking.scheduledTimeStart} – {booking.scheduledTimeEnd}</span>
            </div>
            <div className="pt-2 border-t border-[rgba(176,141,87,0.06)] flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase text-[rgba(237,230,214,0.40)]">Deposit Status</span>
              <span className="font-mono text-xs text-emerald-400 font-semibold">{booking.paymentStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Technician Assignment Interface */}
      <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.20)] rounded-[2px] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[rgba(176,141,87,0.10)]">
          <div>
            <h3 className="font-display text-lg text-[#EDE6D6]">Horologist Assignment Interface</h3>
            <p className="font-mono text-[10px] text-[rgba(237,230,214,0.40)]">
              Select an available master watchmaker and dispatch the service ticket
            </p>
          </div>
          {booking.technician && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 font-mono text-xs rounded-[1px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Assigned: {booking.technician.user?.name}</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableTechnicians.map((tech) => {
            const isSelected = selectedTechId === tech.id;
            return (
              <div
                key={tech.id}
                onClick={() => setSelectedTechId(tech.id)}
                className={`p-3.5 rounded-[2px] border cursor-pointer transition-all relative ${
                  isSelected
                    ? 'bg-[#14110F] border-[#B08D57] shadow-md shadow-[#B08D57]/10'
                    : tech.isRecommended
                    ? 'bg-[#14110F]/80 border-[rgba(176,141,87,0.35)] hover:border-[#B08D57]'
                    : 'bg-[#14110F]/60 border-[rgba(176,141,87,0.15)] hover:border-[rgba(176,141,87,0.30)]'
                }`}
              >
                {tech.isRecommended && (
                  <div className="mb-2">
                    <span className="px-1.5 py-0.5 bg-[rgba(176,141,87,0.15)] border border-[#B08D57]/40 text-[#B08D57] font-mono text-[9px] uppercase tracking-wider rounded-[1px]">
                      ★ Recommended Dispatch
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-1.5">
                  <p className="font-medium text-xs text-[#EDE6D6]">{tech.name}</p>
                  <span className="font-mono text-[10px] text-[#B08D57]">★ {tech.rating.toFixed(1)}</span>
                </div>
                <p className="font-mono text-[10px] text-[rgba(237,230,214,0.40)] truncate">
                  {tech.specializations.join(', ')}
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-[rgba(237,230,214,0.50)] pt-1.5 border-t border-[rgba(176,141,87,0.08)]">
                  <span>
                    {tech.distanceKm !== null && tech.distanceKm !== undefined ? (
                      <span className="text-[#B08D57] font-medium">📍 {tech.distanceKm} km away</span>
                    ) : (
                      <span>Jobs: <strong className="text-[#EDE6D6]">{tech.activeJobs}</strong></span>
                    )}
                  </span>
                  <span className={tech.isAvailable ? 'text-emerald-400' : 'text-amber-400'}>
                    {tech.isAvailable ? 'Available' : 'Busy'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 flex justify-end">
          <Button
            onClick={handleAssignTechnician}
            variant="primary"
            size="md"
            loading={isAssigning}
            disabled={!selectedTechId || selectedTechId === booking.technicianId}
          >
            <UserCheck className="w-4 h-4 mr-1.5" />
            <span>{booking.technicianId ? 'Reassign Horologist' : 'Assign Horologist'}</span>
          </Button>
        </div>
      </div>

      {/* Service Workflow & Milestones Control */}
      <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 space-y-5">
        <h3 className="font-display text-lg text-[#EDE6D6] pb-2 border-b border-[rgba(176,141,87,0.10)]">
          Workflow Transition & Financial Control
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] mb-1">
              Select Target Status
            </label>
            <select
              value={currentStatus}
              onChange={(e) => setCurrentStatus(e.target.value)}
              className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3.5 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
            >
              {STATUS_WORKFLOW.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] mb-1">
              Restoration Cost (₹)
            </label>
            <input
              type="number"
              value={finalPrice}
              onChange={(e) => setFinalPrice(Number(e.target.value))}
              placeholder="e.g. 12500"
              className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3.5 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] mb-1">
              Service Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3.5 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
            >
              <option value="UNPAID">UNPAID</option>
              <option value="DEPOSIT_PAID">DEPOSIT_PAID</option>
              <option value="FULLY_PAID">FULLY_PAID</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] mb-1">
            Customer-Visible Progress Update Note
          </label>
          <input
            type="text"
            value={serviceNote}
            onChange={(e) => setServiceNote(e.target.value)}
            placeholder="e.g. Movement disassembled, ultrasonic cleaning completed, balance spring regulated."
            className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3.5 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleUpdateStatus}
            variant="primary"
            size="md"
            loading={isUpdatingStatus}
          >
            <span>Update Workflow State & Save Milestones</span>
          </Button>
        </div>
      </div>

      {/* Service Milestones Audit History */}
      {booking.serviceHistory && booking.serviceHistory.length > 0 && (
        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 space-y-4">
          <h3 className="font-display text-lg text-[#EDE6D6] pb-2 border-b border-[rgba(176,141,87,0.10)]">
            Service History & Chronological Audit Log
          </h3>

          <div className="space-y-3">
            {booking.serviceHistory.map((item: any) => (
              <div
                key={item.id}
                className="p-3 bg-[#14110F] border border-[rgba(176,141,87,0.08)] rounded-[2px] flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-mono text-[#B08D57] font-semibold block">{item.serviceType}</span>
                  <p className="text-[rgba(237,230,214,0.80)] mt-0.5">{item.description}</p>
                  <span className="font-mono text-[10px] text-[rgba(237,230,214,0.40)]">Logged by: {item.technicianName}</span>
                </div>
                <div className="text-right font-mono text-[11px] text-[rgba(237,230,214,0.50)]">
                  {new Date(item.date).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
