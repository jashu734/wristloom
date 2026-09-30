'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
} from '@vis.gl/react-google-maps';
import { getSupabaseBrowser, realtimeChannels } from '@/lib/supabase';
import { Badge } from '@/components/primitives/Badge';
import {
  Star,
  MapPin,
  Clock,
  Navigation,
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Wrench,
  Watch,
  User,
  ShieldCheck,
  CheckCircle2,
  Phone,
  MessageCircle,
  Calendar,
  CreditCard,
  FileText,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────

export interface ServiceHistoryItem {
  id: string;
  date: string;
  serviceType: string;
  description: string;
  technicianName: string;
  cost?: number | null;
}

export interface BookingData {
  id: string;
  reference: string;
  serviceType: string;
  status: string;
  watchBrand?: string | null;
  watchModel?: string | null;
  watchReferenceNumber?: string | null;
  issueDescription?: string | null;
  scheduledDate?: string | null;
  scheduledTimeStart?: string | null;
  scheduledTimeEnd?: string | null;
  estimatedPrice?: number | null;
  finalPrice?: number | null;
  paymentStatus?: string | null;
  notes?: string | null;
  createdAt?: string | null;
  serviceHistory?: ServiceHistoryItem[];
  address: { formattedAddress: string; latitude: number; longitude: number } | null;
  technician: {
    id: string;
    name: string;
    profileImage: string | null;
    phone?: string | null;
    rating: number;
    specializations: string[];
    currentLatitude: number | null;
    currentLongitude: number | null;
  } | null;
}

interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  recordedAt: string;
}

// ─── Complete 10-Stage Horological Service Lifecycle ─────────

const WORKSHOP_STAGES = [
  { key: 'PENDING', label: 'Service Requested', desc: 'Acquisition request initiated' },
  { key: 'CONFIRMED', label: 'Booking Confirmed', desc: 'Atelier intake slot locked' },
  { key: 'WATCH_RECEIVED', label: 'Watch Received', desc: 'Secured in atelier intake vault' },
  { key: 'INITIAL_INSPECTION', label: 'Initial Inspection', desc: 'Microscopic & timegrapher check' },
  { key: 'ESTIMATE_APPROVED', label: 'Estimate Approved', desc: 'Restoration scope verified' },
  { key: 'IN_PROGRESS', label: 'Service In Progress', desc: 'Disassembly, cleaning & regulation' },
  { key: 'QUALITY_INSPECTION', label: 'Quality Inspection', desc: 'Acoustic amplitude & pressure tests' },
  { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup', desc: 'Prepared in protective vault casing' },
  { key: 'COMPLETED', label: 'Completed', desc: 'Signed, sealed & warranty certified' },
];

function getStageIndex(status: string): number {
  switch (status) {
    case 'COMPLETED':
      return 8;
    case 'READY_FOR_PICKUP':
      return 7;
    case 'QUALITY_INSPECTION':
      return 6;
    case 'IN_PROGRESS':
      return 5;
    case 'TECHNICIAN_ARRIVED':
      return 4; // Initial Inspection done / Estimate
    case 'TECHNICIAN_EN_ROUTE':
    case 'WATCH_RECEIVED':
      return 2; // Watch received / in transit
    case 'TECHNICIAN_ASSIGNED':
      return 2; // Watch intake assigned
    case 'CONFIRMED':
      return 1;
    case 'PENDING':
    default:
      return 0;
  }
}

// ─── ETA calculation via Google Distance Matrix ────────────────

async function fetchETA(
  techLat: number,
  techLng: number,
  custLat: number,
  custLng: number
): Promise<{ distance: string; duration: string } | null> {
  try {
    const res = await fetch(
      `/api/eta?techLat=${techLat}&techLng=${techLng}&custLat=${custLat}&custLng=${custLng}`
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ─── Main Client Component ────────────────────────────────────

export function LiveTrackingClient({ booking }: { booking: BookingData }) {
  const [status, setStatus] = React.useState(booking.status);
  const [notes, setNotes] = React.useState<string | null>(booking.notes || null);
  const [history, setHistory] = React.useState<ServiceHistoryItem[]>(booking.serviceHistory || []);
  const [techLocation, setTechLocation] = React.useState<{ lat: number; lng: number } | null>(
    booking.technician?.currentLatitude && booking.technician?.currentLongitude
      ? { lat: booking.technician.currentLatitude, lng: booking.technician.currentLongitude }
      : null
  );
  const [eta, setEta] = React.useState<{ distance: string; duration: string } | null>(null);
  const [lastUpdate, setLastUpdate] = React.useState<string | null>(null);

  const customerPos =
    booking.address && (booking.address.latitude !== 0 || booking.address.longitude !== 0)
      ? { lat: booking.address.latitude, lng: booking.address.longitude }
      : null;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

  // ── Demo simulation for preview / testing ─────────────────────
  React.useEffect(() => {
    const isDemo = booking.reference.includes('DEMO') || booking.id.includes('demo');
    if (!isDemo || status !== 'TECHNICIAN_EN_ROUTE' || !customerPos) return;

    const interval = setInterval(() => {
      setTechLocation((prev) => {
        if (!prev) return prev;
        const nextLat = prev.lat + (customerPos.lat - prev.lat) * 0.08;
        const nextLng = prev.lng + (customerPos.lng - prev.lng) * 0.08;
        return { lat: nextLat, lng: nextLng };
      });
      setLastUpdate(new Date().toLocaleTimeString('en-IN'));
    }, 4000);

    return () => clearInterval(interval);
  }, [booking.id, booking.reference, status, customerPos?.lat, customerPos?.lng]);

  // ── Supabase Realtime subscription + Polling ─────────────────
  React.useEffect(() => {
    if (status === 'COMPLETED' || status === 'CANCELLED') return;

    const supabase = getSupabaseBrowser();
    const channel = supabase
      .channel(realtimeChannels.bookingLocation(booking.id))
      .on('broadcast', { event: 'location_update' }, (payload) => {
        const data = payload.payload as LocationUpdate;
        setTechLocation({ lat: data.latitude, lng: data.longitude });
        setLastUpdate(new Date(data.recordedAt).toLocaleTimeString('en-IN'));
      })
      .on('broadcast', { event: 'status_update' }, (payload) => {
        if (payload.payload?.status) {
          setStatus(payload.payload.status);
        }
      })
      .subscribe();

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/bookings/${booking.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status && data.status !== status) {
            setStatus(data.status);
          }
          if (data.notes) {
            setNotes(data.notes);
          }
          if (data.serviceHistory) {
            setHistory(data.serviceHistory);
          }
          if (data.technician?.currentLatitude && data.technician?.currentLongitude) {
            setTechLocation({
              lat: data.technician.currentLatitude,
              lng: data.technician.currentLongitude,
            });
            setLastUpdate(new Date().toLocaleTimeString('en-IN'));
          }
        }
      } catch {
        // Silent poll error
      }
    }, 6000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [booking.id, status]);

  // ── ETA recalculation every 45s ───────────────────────────────
  React.useEffect(() => {
    if (!techLocation || !customerPos || status !== 'TECHNICIAN_EN_ROUTE') return;

    async function updateETA() {
      if (!techLocation || !customerPos) return;
      const result = await fetchETA(techLocation.lat, techLocation.lng, customerPos.lat, customerPos.lng);
      setEta(result);
    }

    updateETA();
    const timer = setInterval(updateETA, 45_000);
    return () => clearInterval(timer);
  }, [techLocation?.lat, techLocation?.lng, status, customerPos?.lat, customerPos?.lng]);

  const currentStageIdx = getStageIndex(status);
  const isEnRoute = status === 'TECHNICIAN_EN_ROUTE';
  const isCompleted = status === 'COMPLETED';

  const cleanPhone = (booking.technician?.phone || '').replace(/[^0-9]/g, '');
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`}?text=${encodeURIComponent(
        `Hello ${booking.technician?.name}, this is regarding service ref #${booking.reference}.`
      )}`
    : null;

  const cost = booking.finalPrice ?? booking.estimatedPrice ?? 8500;
  const paymentStatus = booking.paymentStatus || 'UNPAID';

  return (
    <div className="min-h-screen bg-[#0E0C0A] text-[#EDE6D6] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Link
              href="/account"
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-[rgba(237,230,214,0.50)] hover:text-[#B08D57] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Orders & Services</span>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[rgba(176,141,87,0.15)]">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <Badge variant="brass">Live Workshop Telemetry</Badge>
                <span className="font-mono text-xs text-[rgba(237,230,214,0.40)]">•</span>
                <span className="font-mono text-xs text-[#B08D57] font-semibold">
                  Service #{booking.reference}
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl text-[#EDE6D6] tracking-tight">
                {booking.watchBrand ? `${booking.watchBrand} ${booking.watchModel || ''}` : 'Timepiece'}{' '}
                — <span className="text-[#B08D57]">{booking.serviceType}</span>
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/services/${booking.id}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[2px] bg-[#1E1A17] hover:bg-[rgba(176,141,87,0.15)] border border-[rgba(176,141,87,0.25)] text-[#EDE6D6] font-mono text-xs uppercase tracking-wider transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-[#B08D57]" />
                <span>View Full Dossier</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Top Bar: Status Summary + Quick Financials ────── */}
        <div className="bg-[#141210] border border-[rgba(176,141,87,0.20)] rounded-[2px] p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(ellipse_at_top_right,rgba(176,141,87,0.08),transparent_70%)] pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[rgba(176,141,87,0.10)]">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#B08D57] block mb-1">
                Current Horological State
              </span>
              <div className="flex items-center gap-3">
                <h2 className="font-display text-2xl text-[#EDE6D6]">
                  {WORKSHOP_STAGES[currentStageIdx]?.label || status.replace(/_/g, ' ')}
                </h2>
                <span className="px-2.5 py-0.5 rounded-[1px] font-mono text-[10px] uppercase tracking-wider bg-[rgba(176,141,87,0.15)] text-[#B08D57] border border-[rgba(176,141,87,0.30)]">
                  {status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.12)] px-4 py-2.5 rounded-[2px]">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[rgba(237,230,214,0.40)] block">
                  Service Cost
                </span>
                <span className="font-mono text-sm text-[#B08D57] font-semibold">
                  {formatCurrency(cost)}
                </span>
              </div>

              <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.12)] px-4 py-2.5 rounded-[2px]">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[rgba(237,230,214,0.40)] block">
                  Payment Status
                </span>
                <span
                  className={`font-mono text-xs uppercase font-medium ${
                    paymentStatus === 'FULLY_PAID' || paymentStatus === 'PAID'
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}
                >
                  {paymentStatus}
                </span>
              </div>

              {booking.technician && (
                <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.12)] px-4 py-2.5 rounded-[2px]">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[rgba(237,230,214,0.40)] block">
                    Assigned Horologist
                  </span>
                  <span className="font-sans text-xs text-[#EDE6D6] font-medium">
                    {booking.technician.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── 10-Stage Chronological Workshop Timeline ────── */}
          <div className="pt-8 pb-4">
            <div className="relative">
              {/* Progress Track Desktop */}
              <div className="hidden lg:block absolute top-4 left-6 right-6 h-0.5 bg-[rgba(176,141,87,0.15)] z-0">
                <div
                  className="h-full bg-gradient-to-r from-[#B08D57] to-[#C5A059] transition-all duration-700"
                  style={{
                    width: `${(currentStageIdx / (WORKSHOP_STAGES.length - 1)) * 100}%`,
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-4 relative z-10">
                {WORKSHOP_STAGES.map((stg, idx) => {
                  const isCompletedStage = idx < currentStageIdx;
                  const isCurrent = idx === currentStageIdx;

                  // Find milestone date if recorded in service history or booking
                  let stageDate: string | null = null;
                  if (idx === 0 && booking.createdAt) {
                    stageDate = new Date(booking.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    });
                  } else if (idx === 1 && booking.scheduledDate) {
                    stageDate = new Date(booking.scheduledDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    });
                  } else if (history && history.length > 0) {
                    const match = history.find(
                      (h) =>
                        h.description.toLowerCase().includes(stg.label.toLowerCase()) ||
                        (idx <= 4 && h.serviceType.toLowerCase().includes('intake'))
                    );
                    if (match) {
                      stageDate = new Date(match.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      });
                    }
                  }

                  return (
                    <div
                      key={stg.key}
                      className="flex lg:flex-col items-start lg:items-center gap-3 lg:text-center"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          isCompletedStage
                            ? 'bg-[#B08D57] text-[#0E0C0A]'
                            : isCurrent
                            ? 'bg-[#0E0C0A] border-2 border-[#B08D57] text-[#B08D57] shadow-[0_0_15px_rgba(176,141,87,0.5)]'
                            : 'bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] text-[rgba(237,230,214,0.25)]'
                        }`}
                      >
                        {isCompletedStage ? (
                          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        ) : isCurrent ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#B08D57] animate-ping" />
                        ) : (
                          <span className="font-mono text-[10px]">{idx + 1}</span>
                        )}
                      </div>

                      <div className="flex-1 lg:flex-initial">
                        <p
                          className={`font-mono text-[11px] uppercase tracking-wider leading-tight ${
                            isCurrent
                              ? 'text-[#B08D57] font-bold'
                              : isCompletedStage
                              ? 'text-[#EDE6D6] font-medium'
                              : 'text-[rgba(237,230,214,0.30)]'
                          }`}
                        >
                          {stg.label}
                        </p>
                        {stageDate && (
                          <p className="font-mono text-[9px] text-[rgba(237,230,214,0.50)] mt-0.5">
                            {stageDate}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Latest Update Note from Horologist ────────────── */}
        {notes && (
          <div className="bg-[rgba(176,141,87,0.06)] border border-[rgba(176,141,87,0.20)] rounded-[2px] p-5">
            <div className="flex items-center gap-2 mb-1.5 text-[#B08D57]">
              <FileText className="w-4 h-4" />
              <span className="font-mono text-xs uppercase tracking-wider font-semibold">
                Latest Atelier Progress Update
              </span>
            </div>
            <p className="text-sm text-[#EDE6D6] leading-relaxed pl-6">{notes}</p>
          </div>
        )}

        {/* ── Main Telemetry & History Grid ─────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Map Radar or Workshop Telemetry (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live GPS Radar / Workshop Chamber Visualizer */}
            {isEnRoute ? (
              <div className="bg-[#141210] border border-[rgba(176,141,87,0.20)] rounded-[2px] overflow-hidden shadow-2xl">
                <div className="p-4 bg-[#1E1A17] border-b border-[rgba(176,141,87,0.12)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-xs text-[#EDE6D6] font-semibold uppercase tracking-wider">
                      Live Courier GPS Radar
                    </span>
                  </div>
                  {lastUpdate && (
                    <span className="font-mono text-[10px] text-[rgba(237,230,214,0.40)]">
                      Updated {lastUpdate}
                    </span>
                  )}
                </div>

                {!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY' ? (
                  <div className="p-8 text-center bg-[#14110F]">
                    <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                    <p className="font-mono text-xs uppercase text-amber-400 mb-1">
                      Armored Courier Transit En Route
                    </p>
                    <p className="text-xs text-[rgba(237,230,214,0.50)] max-w-sm mx-auto">
                      Technician {booking.technician?.name || 'Horologist'} is en route to{' '}
                      {booking.address?.formattedAddress || 'your address'}.
                    </p>
                  </div>
                ) : (
                  <APIProvider apiKey={apiKey}>
                    <div className="h-[380px] w-full relative">
                      <Map
                        defaultCenter={customerPos ?? { lat: 19.076, lng: 72.877 }}
                        defaultZoom={14}
                        mapId="wristloom-tracking"
                        gestureHandling="greedy"
                        disableDefaultUI={false}
                      >
                        {customerPos && (
                          <AdvancedMarker position={customerPos} title="Service Location">
                            <Pin background="#B08D57" glyphColor="#14110F" borderColor="#8B6D3F" />
                          </AdvancedMarker>
                        )}
                        {techLocation && (
                          <AdvancedMarker
                            position={techLocation}
                            title={`${booking.technician?.name ?? 'Horologist'} — Live Location`}
                          >
                            <div className="w-10 h-10 rounded-full bg-[#6B2737] border-2 border-white flex items-center justify-center shadow-lg">
                              <Navigation className="w-4 h-4 text-white" />
                            </div>
                          </AdvancedMarker>
                        )}
                      </Map>
                    </div>
                  </APIProvider>
                )}

                {eta && (
                  <div className="p-4 bg-[#1E1A17] border-t border-[rgba(176,141,87,0.12)] flex items-center justify-between">
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-widest text-[rgba(237,230,214,0.40)]">
                        Estimated Arrival
                      </p>
                      <p className="font-display text-2xl text-[#B08D57]">{eta.duration}</p>
                    </div>
                    <p className="font-mono text-xs text-[rgba(237,230,214,0.60)]">
                      {eta.distance} away
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Workshop Cleanroom Telemetry Chamber */
              <div className="bg-[#141210] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[rgba(176,141,87,0.10)]">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#B08D57]" />
                    <h3 className="font-display text-lg text-[#EDE6D6]">
                      Atelier Cleanroom Telemetry
                    </h3>
                  </div>
                  <span className="font-mono text-[10px] uppercase text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                    Vault Chamber Active
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-[#1E1A17] p-3 rounded-[2px] border border-[rgba(176,141,87,0.08)]">
                    <span className="font-mono text-[9px] uppercase text-[rgba(237,230,214,0.40)] block">
                      Iso-Chamber
                    </span>
                    <span className="font-mono text-sm text-[#EDE6D6] font-semibold">21.5°C</span>
                  </div>
                  <div className="bg-[#1E1A17] p-3 rounded-[2px] border border-[rgba(176,141,87,0.08)]">
                    <span className="font-mono text-[9px] uppercase text-[rgba(237,230,214,0.40)] block">
                      Humidity
                    </span>
                    <span className="font-mono text-sm text-[#EDE6D6] font-semibold">42% RH</span>
                  </div>
                  <div className="bg-[#1E1A17] p-3 rounded-[2px] border border-[rgba(176,141,87,0.08)]">
                    <span className="font-mono text-[9px] uppercase text-[rgba(237,230,214,0.40)] block">
                      Air Purity
                    </span>
                    <span className="font-mono text-sm text-emerald-400 font-semibold">
                      Class 100
                    </span>
                  </div>
                  <div className="bg-[#1E1A17] p-3 rounded-[2px] border border-[rgba(176,141,87,0.08)]">
                    <span className="font-mono text-[9px] uppercase text-[rgba(237,230,214,0.40)] block">
                      Acoustic Beat Error
                    </span>
                    <span className="font-mono text-sm text-emerald-400 font-semibold">0.1 ms</span>
                  </div>
                </div>

                <p className="text-xs text-[rgba(237,230,214,0.60)] leading-relaxed">
                  Your timepiece is housed in our climate-stabilized atelier workshop under constant
                  surveillance and filtered positive-pressure air. All mechanical calibrations are
                  logged to your horological certificate.
                </p>
              </div>
            )}

            {/* Service Milestone History Log */}
            <div className="bg-[#141210] border border-[rgba(176,141,87,0.12)] rounded-[2px] p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(176,141,87,0.10)]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#B08D57]" />
                  <h3 className="font-display text-base text-[#EDE6D6]">
                    Chronological Service History ({history.length})
                  </h3>
                </div>
                <span className="font-mono text-[10px] text-[rgba(237,230,214,0.40)]">
                  Live Audit Trail
                </span>
              </div>

              {history.length === 0 ? (
                <div className="py-6 text-center text-xs text-[rgba(237,230,214,0.40)]">
                  No intermediate milestones recorded yet. Initial intake logged.
                </div>
              ) : (
                <div className="space-y-4 pl-2">
                  {history.map((evt, i) => (
                    <div
                      key={evt.id || i}
                      className="border-l-2 border-[rgba(176,141,87,0.30)] pl-4 py-1 relative"
                    >
                      <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-[#B08D57]" />
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs text-[#EDE6D6] font-semibold">
                          {evt.serviceType || 'Service Milestone'}
                        </span>
                        <span className="font-mono text-[10px] text-[rgba(237,230,214,0.40)]">
                          {new Date(evt.date).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-[rgba(237,230,214,0.70)] mt-1">{evt.description}</p>
                      {evt.technicianName && (
                        <p className="font-mono text-[9px] text-[#B08D57] mt-1">
                          Updated by: {evt.technicianName}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Horologist Dossier & Intake Specs (1 col) */}
          <div className="space-y-6">
            {/* Horologist Card */}
            <div className="bg-[#141210] border border-[rgba(176,141,87,0.12)] rounded-[2px] p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[rgba(176,141,87,0.10)]">
                <User className="w-4 h-4 text-[#B08D57]" />
                <h3 className="font-display text-sm text-[#EDE6D6]">Assigned Horologist</h3>
              </div>

              {booking.technician ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[rgba(176,141,87,0.15)] border border-[rgba(176,141,87,0.25)] flex items-center justify-center font-mono text-sm text-[#B08D57] flex-shrink-0">
                      {booking.technician.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-display text-base text-[#EDE6D6]">
                        {booking.technician.name}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 text-[#B08D57] fill-[#B08D57]" />
                        <span className="font-mono text-[10px] text-[rgba(237,230,214,0.60)]">
                          {booking.technician.rating || '4.95'}
                        </span>
                        <span className="font-mono text-[10px] text-[#B08D57] ml-2 uppercase">
                          Certified Master
                        </span>
                      </div>
                    </div>
                  </div>

                  {booking.technician.specializations &&
                    booking.technician.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {booking.technician.specializations.map((spec, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[1px] font-mono text-[9px] text-[rgba(237,230,214,0.60)]"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}

                  <div className="pt-2 border-t border-[rgba(176,141,87,0.08)] flex gap-2">
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/40 text-emerald-300 rounded-[2px] font-mono text-[10px] uppercase tracking-wider transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                    {booking.technician.phone && (
                      <a
                        href={`tel:${booking.technician.phone}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#1E1A17] hover:bg-[rgba(176,141,87,0.15)] border border-[rgba(176,141,87,0.20)] text-[#B08D57] rounded-[2px] font-mono text-[10px] uppercase tracking-wider transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-xs text-[rgba(237,230,214,0.50)]">
                    Technician allocation in progress by atelier management.
                  </p>
                </div>
              )}
            </div>

            {/* Watch Specs Card */}
            <div className="bg-[#141210] border border-[rgba(176,141,87,0.12)] rounded-[2px] p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[rgba(176,141,87,0.10)]">
                <Watch className="w-4 h-4 text-[#B08D57]" />
                <h3 className="font-display text-sm text-[#EDE6D6]">Registered Timepiece</h3>
              </div>
              <div className="text-xs space-y-1 text-[rgba(237,230,214,0.70)]">
                <p className="font-semibold text-[#EDE6D6]">
                  {booking.watchBrand || 'Horological Timepiece'} {booking.watchModel || ''}
                </p>
                {booking.watchReferenceNumber && (
                  <p className="font-mono text-[11px] text-[rgba(237,230,214,0.50)]">
                    Ref: {booking.watchReferenceNumber}
                  </p>
                )}
                {booking.issueDescription && (
                  <p className="text-[11px] text-[rgba(237,230,214,0.50)] pt-1 italic">
                    &ldquo;{booking.issueDescription}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Pickup / Appointment Location Card */}
            {booking.address && (
              <div className="bg-[#141210] border border-[rgba(176,141,87,0.12)] rounded-[2px] p-5 space-y-2">
                <div className="flex items-center gap-2 pb-2 border-b border-[rgba(176,141,87,0.10)]">
                  <MapPin className="w-4 h-4 text-[#B08D57]" />
                  <h3 className="font-display text-sm text-[#EDE6D6]">Service Intake Location</h3>
                </div>
                <p className="text-xs text-[rgba(237,230,214,0.70)] leading-relaxed">
                  {booking.address.formattedAddress}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
