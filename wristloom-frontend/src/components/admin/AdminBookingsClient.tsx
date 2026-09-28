'use client';

import * as React from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Check, Loader2 } from 'lucide-react';

interface TechnicianOption {
  id: string;
  name: string;
}

interface BookingRecord {
  id: string;
  bookingReference: string;
  customer: { name: string | null; email: string; phone: string | null };
  watchBrand: string | null;
  watchModel: string | null;
  watchReferenceNumber: string | null;
  serviceType: string;
  scheduledDate: string | Date;
  scheduledTimeStart: string;
  scheduledTimeEnd: string;
  paymentStatus: string;
  status: string;
  technicianId: string | null;
  technician: { id: string; user: { name: string | null } } | null;
}

const STATUS_OPTIONS = [
  'PENDING',
  'CONFIRMED',
  'TECHNICIAN_ASSIGNED',
  'TECHNICIAN_EN_ROUTE',
  'TECHNICIAN_ARRIVED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
];

export function AdminBookingsClient({
  initialBookings,
  technicians,
}: {
  initialBookings: BookingRecord[];
  technicians: TechnicianOption[];
}) {
  const [bookings, setBookings] = React.useState<BookingRecord[]>(initialBookings);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  async function updateBooking(id: string, patch: { status?: string; technicianId?: string }) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });

      if (res.ok) {
        const updated = await res.json();
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, ...updated } : b))
        );
      }
    } catch (err) {
      console.error('Failed to update booking:', err);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-[rgba(176,141,87,0.10)] bg-[rgba(20,17,15,0.40)]">
              {['Reference', 'Customer', 'Watch Details', 'Service', 'Date & Slot', 'Payment', 'Status Action', 'Assign Technician'].map((h) => (
                <th key={h} className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(176,141,87,0.06)]">
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-[rgba(176,141,87,0.04)] transition-colors">
                <td className="px-4 py-3 font-mono text-[11px] text-[#B08D57] font-medium whitespace-nowrap">
                  <Link href={`/service-tracking/${b.id}`} className="hover:underline flex items-center gap-1.5">
                    {b.bookingReference}
                    {updatingId === b.id && <Loader2 className="w-3 h-3 animate-spin text-[#B08D57]" />}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p className="text-[#EDE6D6] font-medium">{b.customer.name || 'Guest'}</p>
                  <p className="text-xs text-[rgba(237,230,214,0.40)]">{b.customer.email}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs text-[#EDE6D6]">{b.watchBrand || '—'} {b.watchModel || ''}</p>
                  {b.watchReferenceNumber && (
                    <p className="font-mono text-[10px] text-[rgba(237,230,214,0.35)]">Ref: {b.watchReferenceNumber}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-[rgba(237,230,214,0.70)]">
                  {b.serviceType}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <p className="font-mono text-[11px] text-[#EDE6D6]">{formatDate(b.scheduledDate)}</p>
                  <p className="font-mono text-[10px] text-[rgba(237,230,214,0.40)]">{b.scheduledTimeStart} – {b.scheduledTimeEnd}</p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-[1px] border ${
                    b.paymentStatus === 'DEPOSIT_PAID' || b.paymentStatus === 'FULLY_PAID'
                      ? 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40'
                      : 'text-amber-400 bg-amber-950/30 border-amber-800/40'
                  }`}>
                    {b.paymentStatus.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <select
                    value={b.status}
                    disabled={updatingId === b.id}
                    onChange={(e) => updateBooking(b.id, { status: e.target.value })}
                    className="bg-[#14110F] border border-[rgba(176,141,87,0.20)] text-[#EDE6D6] font-mono text-[10px] uppercase rounded-[2px] px-2 py-1 focus:outline-none focus:border-[#B08D57] cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <select
                    value={b.technicianId || ''}
                    disabled={updatingId === b.id}
                    onChange={(e) => updateBooking(b.id, { technicianId: e.target.value || undefined })}
                    className="bg-[#14110F] border border-[rgba(176,141,87,0.20)] text-[#EDE6D6] text-xs rounded-[2px] px-2 py-1 focus:outline-none focus:border-[#B08D57] cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-[rgba(237,230,214,0.40)] italic">
                  No repair bookings recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
