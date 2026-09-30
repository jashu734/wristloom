'use client';

import * as React from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { LocationTracker } from './LocationTracker';
import {
  MapPin, Navigation, Phone, Watch, Clock, CheckCircle,
  AlertCircle, Loader2, ToggleLeft, ToggleRight, MessageCircle,
  ShieldCheck, X, FileText, CheckCircle2, LogOut, Bell, Camera, Upload,
} from 'lucide-react';

type BookingStatus =
  | 'PENDING' | 'CONFIRMED' | 'TECHNICIAN_ASSIGNED' | 'TECHNICIAN_EN_ROUTE'
  | 'TECHNICIAN_ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface Booking {
  id: string;
  bookingReference: string;
  serviceType: string;
  watchBrand?: string;
  watchModel?: string;
  issueDescription?: string;
  scheduledDate: string;
  scheduledTimeStart: string;
  scheduledTimeEnd: string;
  status: BookingStatus;
  customer: { name: string; phone: string; profileImage?: string };
  address?: {
    formattedAddress: string;
    addressLine2?: string;
    latitude: number;
    longitude: number;
    fullName: string;
    phone: string;
  };
}

const STATUS_FLOW: { from: BookingStatus; to: BookingStatus; label: string }[] = [
  { from: 'PENDING', to: 'TECHNICIAN_EN_ROUTE', label: "I'm On My Way (En Route)" },
  { from: 'CONFIRMED', to: 'TECHNICIAN_EN_ROUTE', label: "I'm On My Way (En Route)" },
  { from: 'TECHNICIAN_ASSIGNED', to: 'TECHNICIAN_EN_ROUTE', label: "I'm On My Way (En Route)" },
  { from: 'TECHNICIAN_EN_ROUTE', to: 'TECHNICIAN_ARRIVED', label: "Watch Intake / Arrived" },
  { from: 'TECHNICIAN_ARRIVED', to: 'IN_PROGRESS', label: 'Start Mechanical Restoration' },
  { from: 'IN_PROGRESS', to: 'COMPLETED', label: 'Complete & Certify Service' },
];

const STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING: 'neutral', CONFIRMED: 'neutral', TECHNICIAN_ASSIGNED: 'brass',
  TECHNICIAN_EN_ROUTE: 'limited', TECHNICIAN_ARRIVED: 'healthy',
  IN_PROGRESS: 'certified', COMPLETED: 'excellent', CANCELLED: 'oxblood',
};

export function TechnicianDashboard({ userId, userName }: { userId: string; userName: string }) {
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAvailable, setIsAvailable] = React.useState(true);
  const [activeBookingId, setActiveBookingId] = React.useState<string | null>(null);
  const [techId, setTechId] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'today' | 'upcoming' | 'completed'>('today');
  const [newJobAlert, setNewJobAlert] = React.useState<string | null>(null);

  // Fetch technician profile + bookings
  React.useEffect(() => {
    async function load() {
      const [techRes, bookingsRes] = await Promise.all([
        fetch('/api/technicians'),
        fetch('/api/bookings'),
      ]);
      const techList = await techRes.json();
      const myTech = Array.isArray(techList) ? techList.find((t: any) => t.userId === userId) : null;
      if (myTech) {
        setTechId(myTech.id);
        setIsAvailable(myTech.isAvailable);
      }
      if (bookingsRes.ok) setBookings(await bookingsRes.json());
      setLoading(false);
    }
    load();
  }, [userId]);

  // Real-time job polling & notification
  React.useEffect(() => {
    if (!techId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/bookings');
        if (res.ok) {
          const fresh: Booking[] = await res.json();
          setBookings((prev) => {
            const prevIds = new Set(prev.map((b) => b.id));
            const newlyAdded = fresh.filter((b) => !prevIds.has(b.id));
            if (newlyAdded.length > 0) {
              setNewJobAlert(`New service booking assigned: ${newlyAdded[0].watchBrand || 'Watch'} (#${newlyAdded[0].bookingReference})`);
              setTimeout(() => setNewJobAlert(null), 8000);
            }
            return fresh;
          });
        }
      } catch {
        // background poll quiet
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [techId]);

  async function updateStatus(bookingId: string, status: BookingStatus, notes?: string, afterPhoto?: string) {
    const payload: Record<string, any> = { status };
    if (notes) payload.notes = notes;
    if (afterPhoto) payload.serviceImages = [afterPhoto];

    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const updated = await res.json();
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: updated.status } : b)));
      if (status === 'TECHNICIAN_EN_ROUTE') setActiveBookingId(bookingId);
      if (status === 'TECHNICIAN_ARRIVED' || status === 'COMPLETED') setActiveBookingId(null);
    }
  }

  async function toggleAvailability() {
    if (!techId) return;
    const next = !isAvailable;
    await fetch(`/api/technicians/${techId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: next }),
    });
    setIsAvailable(next);
  }

  const todayBookings = bookings.filter((b) => isToday(parseISO(b.scheduledDate)));
  const todayCompleted = todayBookings.filter((b) => b.status === 'COMPLETED').length;
  const todayRemaining = todayBookings.filter((b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED').length;
  const todayEarnings = todayBookings
    .filter((b) => b.status === 'COMPLETED')
    .reduce((sum, b: any) => sum + (b.finalPrice || b.estimatedPrice || b.depositAmount || 2500), 0);

  const today = bookings
    .filter((b) => isToday(parseISO(b.scheduledDate)) && b.status !== 'COMPLETED' && b.status !== 'CANCELLED')
    .sort((a, b) => a.scheduledTimeStart.localeCompare(b.scheduledTimeStart));
  const upcoming = bookings
    .filter((b) => !isToday(parseISO(b.scheduledDate)) && b.status !== 'COMPLETED' && b.status !== 'CANCELLED')
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  const completed = bookings
    .filter((b) => b.status === 'COMPLETED')
    .sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));

  const shown = activeTab === 'today' ? today : activeTab === 'upcoming' ? upcoming : completed;

  if (loading) return (
    <div className="min-h-screen bg-[#14110F] flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-[#B08D57] animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#14110F]">
      {/* GPS location tracker — only active when en route */}
      {activeBookingId && techId && (
        <LocationTracker bookingId={activeBookingId} technicianId={techId} />
      )}

      {/* Real-time New Job Banner */}
      {newJobAlert && (
        <div className="bg-[#B08D57] text-[#14110F] py-2.5 px-4 text-xs font-mono flex items-center justify-between shadow-lg sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 animate-bounce" />
            <span className="font-semibold">{newJobAlert}</span>
          </div>
          <button onClick={() => setNewJobAlert(null)} className="hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)] sticky top-0 z-20">
        <div className="container-wl py-4 flex items-center justify-between">
          <div>
            <p className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.35)]">Technician Portal</p>
            <h1 className="font-display text-xl text-[#EDE6D6]">{userName}</h1>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleAvailability} className="flex items-center gap-1.5 text-xs cursor-pointer">
              {isAvailable ? (
                <><ToggleRight className="w-6 h-6 text-emerald-400" /><span className="text-emerald-400 font-mono text-[10px] uppercase tracking-widest">Available</span></>
              ) : (
                <><ToggleLeft className="w-6 h-6 text-[rgba(237,230,214,0.30)]" /><span className="text-[rgba(237,230,214,0.30)] font-mono text-[10px] uppercase tracking-widest">Offline</span></>
              )}
            </button>

            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] border border-[rgba(176,141,87,0.25)] text-[rgba(237,230,214,0.60)] hover:text-[#EDE6D6] hover:border-[#B08D57] transition-colors text-xs font-mono cursor-pointer"
              title="Sign out of technician portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Today's Summary Strip */}
        <div className="bg-[#14110F] border-t border-b border-[rgba(176,141,87,0.08)] py-2.5">
          <div className="container-wl grid grid-cols-3 gap-3 text-center">
            <div className="bg-[#1E1A17] p-2 rounded-[2px] border border-[rgba(176,141,87,0.08)]">
              <span className="font-mono text-base text-emerald-400 font-semibold">{todayCompleted}</span>
              <p className="font-mono text-[8px] uppercase tracking-widest text-[rgba(237,230,214,0.35)]">Completed Today</p>
            </div>
            <div className="bg-[#1E1A17] p-2 rounded-[2px] border border-[rgba(176,141,87,0.08)]">
              <span className="font-mono text-base text-amber-400 font-semibold">{todayRemaining}</span>
              <p className="font-mono text-[8px] uppercase tracking-widest text-[rgba(237,230,214,0.35)]">Remaining Today</p>
            </div>
            <div className="bg-[#1E1A17] p-2 rounded-[2px] border border-[rgba(176,141,87,0.08)]">
              <span className="font-mono text-base text-[#B08D57] font-semibold">₹{todayEarnings.toLocaleString('en-IN')}</span>
              <p className="font-mono text-[8px] uppercase tracking-widest text-[rgba(237,230,214,0.35)]">Today&apos;s Value</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="container-wl py-2.5 flex gap-1">
          {([['today', `Today (${today.length})`], ['upcoming', `Upcoming (${upcoming.length})`], ['completed', `Completed (${completed.length})`]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-[2px] transition-colors ${activeTab === id ? 'bg-[rgba(176,141,87,0.12)] text-[#B08D57] border border-[rgba(176,141,87,0.25)]' : 'text-[rgba(237,230,214,0.35)] hover:text-[#EDE6D6]'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="container-wl py-8 space-y-4">
        {shown.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[rgba(237,230,214,0.35)] text-sm">No {activeTab} bookings</p>
          </div>
        )}
        {shown.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onUpdateStatus={updateStatus}
          />
        ))}
      </div>
    </div>
  );
}

function BookingCard({ booking, onUpdateStatus }: { booking: Booking; onUpdateStatus: (id: string, s: BookingStatus, notes?: string, afterPhoto?: string) => Promise<void> | void }) {
  const [updating, setUpdating] = React.useState(false);
  const [showCompletionModal, setShowCompletionModal] = React.useState(false);
  const [completionNotes, setCompletionNotes] = React.useState(
    `Movement inspected and regulated. Escapement lubricated with synthetic oils, water-resistance seals verified.`
  );
  const [completionPhoto, setCompletionPhoto] = React.useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = React.useState(false);
  const [photoError, setPhotoError] = React.useState<string | null>(null);

  const [otpInput, setOtpInput] = React.useState('');
  const [otpError, setOtpError] = React.useState<string | null>(null);

  const [progressNote, setProgressNote] = React.useState('');
  const [isSubmittingNote, setIsSubmittingNote] = React.useState(false);
  const [noteSuccess, setNoteSuccess] = React.useState(false);

  const nextAction = STATUS_FLOW.find((f) => f.from === booking.status);

  // Expected 4-digit verification code from reference
  const expectedPin = booking.bookingReference.slice(-4).toUpperCase();

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    setPhotoError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload photo');
      }
      setCompletionPhoto(data.url);
    } catch (err: any) {
      setPhotoError(err.message || 'Photo upload failed');
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  async function handlePostProgressNote() {
    if (!progressNote.trim()) return;
    setIsSubmittingNote(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: progressNote.trim(),
          stageNote: progressNote.trim(),
        }),
      });
      if (res.ok) {
        setNoteSuccess(true);
        setProgressNote('');
        setTimeout(() => setNoteSuccess(false), 3000);
      }
    } finally {
      setIsSubmittingNote(false);
    }
  }

  async function handleStatusChange() {
    if (!nextAction) return;
    if (nextAction.to === 'COMPLETED') {
      setShowCompletionModal(true);
      return;
    }
    setUpdating(true);
    await onUpdateStatus(booking.id, nextAction.to);
    setUpdating(false);
  }

  async function handleConfirmCompletion(e: React.FormEvent) {
    e.preventDefault();
    setOtpError(null);
    setPhotoError(null);

    const enteredClean = otpInput.trim().toUpperCase();
    if (enteredClean && enteredClean !== expectedPin) {
      setOtpError(`Invalid customer PIN. Please enter "${expectedPin}" or verify with customer.`);
      return;
    }

    if (!completionPhoto) {
      setPhotoError('Please upload at least one after-service photo to verify completed work.');
      return;
    }

    if (!completionNotes.trim()) {
      return;
    }

    setUpdating(true);
    await onUpdateStatus(booking.id, 'COMPLETED', completionNotes.trim(), completionPhoto);
    setShowCompletionModal(false);
    setUpdating(false);
  }

  const hasValidCoords = Boolean(
    booking.address &&
    typeof booking.address.latitude === 'number' &&
    typeof booking.address.longitude === 'number' &&
    (booking.address.latitude !== 0 || booking.address.longitude !== 0)
  );

  const destinationQuery = hasValidCoords
    ? `${booking.address!.latitude},${booking.address!.longitude}`
    : booking.address?.formattedAddress ||
      (booking.address
        ? [booking.address.formattedAddress, booking.address.addressLine2]
            .filter(Boolean)
            .join(', ')
        : '');

  const navUrl = destinationQuery
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationQuery)}`
    : null;

  const dateStr = parseISO(booking.scheduledDate);
  const dateLabel = isToday(dateStr) ? 'Today' : isTomorrow(dateStr) ? 'Tomorrow' : format(dateStr, 'd MMM');

  const cleanPhone = (booking.customer.phone || '').replace(/[^0-9]/g, '');
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`}?text=${encodeURIComponent(
        `Hello ${booking.customer.name}, this is your WristLoom certified horologist regarding your ${booking.watchBrand || 'timepiece'} service (ref #${booking.bookingReference}).`
      )}`
    : null;

  return (
    <>
      <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.12)] rounded-[2px] overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(176,141,87,0.08)]">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-[rgba(237,230,214,0.40)]">{booking.bookingReference}</span>
            <Badge variant={STATUS_COLORS[booking.status] as any}>
              {booking.status.replace(/_/g, ' ')}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[rgba(237,230,214,0.45)]">
            <Clock className="w-3 h-3" />
            {dateLabel} · {booking.scheduledTimeStart}–{booking.scheduledTimeEnd}
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Customer */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[rgba(176,141,87,0.10)] flex items-center justify-center flex-shrink-0">
              <span className="font-mono text-[10px] text-[#B08D57]">
                {booking.customer.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm text-[#EDE6D6]">{booking.customer.name}</p>
              <div className="flex items-center gap-3 mt-1">
                <a href={`tel:${booking.customer.phone}`} className="flex items-center gap-1 text-xs text-[#B08D57] hover:underline">
                  <Phone className="w-3 h-3" /> {booking.customer.phone}
                </a>
                {waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <MessageCircle className="w-3 h-3" /> WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Watch + issue */}
          {(booking.watchBrand || booking.issueDescription) && (
            <div className="flex items-start gap-2">
              <Watch className="w-4 h-4 text-[rgba(176,141,87,0.40)] flex-shrink-0 mt-0.5" />
              <div>
                {booking.watchBrand && (
                  <p className="text-sm text-[rgba(237,230,214,0.70)]">{booking.watchBrand} {booking.watchModel}</p>
                )}
                {booking.issueDescription && (
                  <p className="text-xs text-[rgba(237,230,214,0.40)] mt-0.5 leading-relaxed">{booking.issueDescription}</p>
                )}
              </div>
            </div>
          )}

          {/* Address */}
          {booking.address && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[rgba(176,141,87,0.40)] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-[rgba(237,230,214,0.70)]">{booking.address.formattedAddress}</p>
                {booking.address.addressLine2 && (
                  <p className="text-xs text-[rgba(237,230,214,0.45)]">{booking.address.addressLine2}</p>
                )}
              </div>
            </div>
          )}

          {/* Customer-Visible Service Update Note Form */}
          {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
            <div className="pt-2 border-t border-[rgba(176,141,87,0.08)] space-y-2">
              <label className="block font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.40)]">
                Publish Live Progress Note to Customer
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={progressNote}
                  onChange={(e) => setProgressNote(e.target.value)}
                  placeholder="e.g. Movement disassembled and components inspected..."
                  className="flex-1 bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3 py-1.5 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                />
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={handlePostProgressNote}
                  loading={isSubmittingNote}
                  disabled={!progressNote.trim()}
                >
                  Post Update
                </Button>
              </div>
              {noteSuccess && (
                <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Note logged to timeline & visible to customer.
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            {navUrl && (
              <a
                href={navUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase px-4 py-2.5 border border-[rgba(176,141,87,0.25)] text-[#B08D57] hover:bg-[rgba(176,141,87,0.08)] rounded-[2px] transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                Start Navigation
              </a>
            )}
            {nextAction && (
              <Button
                variant={nextAction.to === 'TECHNICIAN_EN_ROUTE' ? 'oxblood' : 'primary'}
                size="md"
                className="flex-1"
                onClick={handleStatusChange}
                loading={updating}
              >
                {nextAction.to === 'TECHNICIAN_EN_ROUTE' && "🚗 "}
                {nextAction.label}
              </Button>
            )}
            {booking.status === 'COMPLETED' && (
              <div className="flex items-center gap-2 text-sm text-emerald-400 font-mono text-xs">
                <CheckCircle className="w-4 h-4" /> Service Certified & Completed
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Service Completion & Handover Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#1E1A17] border border-[rgba(176,141,87,0.30)] rounded-[2px] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(176,141,87,0.15)]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#B08D57]" />
                <h3 className="font-display text-lg text-[#EDE6D6]">Certify Service Completion</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCompletionModal(false)}
                className="text-[rgba(237,230,214,0.40)] hover:text-[#EDE6D6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#14110F] p-3 rounded-[2px] border border-[rgba(176,141,87,0.10)] text-xs space-y-1">
              <p className="font-mono text-[#B08D57] font-medium">{booking.watchBrand || 'Horology'} {booking.watchModel}</p>
              <p className="text-[rgba(237,230,214,0.60)]">Customer: {booking.customer.name} · Ref #{booking.bookingReference}</p>
            </div>

            <form onSubmit={handleConfirmCompletion} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.50)] mb-1.5">
                  Restoration & Diagnostic Notes *
                </label>
                <textarea
                  rows={3}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] p-3 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                  placeholder="Describe parts replaced, calibration tolerances, regulation..."
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.50)] mb-1.5">
                  After-Service Quality Photo *
                </label>
                {completionPhoto ? (
                  <div className="relative rounded border border-[#B08D57]/40 overflow-hidden aspect-video bg-black flex items-center justify-center">
                    <img src={completionPhoto} alt="Completed watch" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setCompletionPhoto(null)}
                      className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full hover:bg-black"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="border border-dashed border-[rgba(176,141,87,0.30)] hover:border-[#B08D57] rounded p-4 flex flex-col items-center justify-center cursor-pointer bg-[#14110F] text-center">
                    <Upload className="w-5 h-5 text-[#B08D57] mb-1" />
                    <span className="text-xs text-[rgba(237,230,214,0.70)]">
                      {isUploadingPhoto ? 'Uploading photo...' : 'Click to upload completed watch photo'}
                    </span>
                    <span className="text-[10px] text-[rgba(237,230,214,0.40)] mt-0.5">JPEG, PNG or WEBP up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingPhoto}
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
                {photoError && <p className="text-xs text-red-400 mt-1 font-mono">{photoError}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.50)]">
                    Customer Handover Code / PIN
                  </label>
                  <span className="font-mono text-[10px] text-[#B08D57]/70">
                    PIN: {expectedPin}
                  </span>
                </div>
                <input
                  type="text"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.toUpperCase())}
                  placeholder={`Enter 4-character PIN (or leave blank to bypass)`}
                  maxLength={6}
                  className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3 py-2.5 text-xs text-[#EDE6D6] font-mono tracking-widest focus:border-[#B08D57] focus:outline-none"
                />
                {otpError && <p className="text-xs text-red-400 mt-1 font-mono">{otpError}</p>}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompletionModal(false)}
                  className="flex-1 py-2.5 border border-[rgba(176,141,87,0.20)] text-xs font-mono uppercase text-[rgba(237,230,214,0.60)] hover:text-[#EDE6D6] rounded-[2px]"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="flex-1"
                  loading={updating}
                >
                  Certify & Complete
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
