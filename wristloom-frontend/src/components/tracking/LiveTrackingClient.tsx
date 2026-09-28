'use client';

import * as React from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
} from '@vis.gl/react-google-maps';
import { getSupabaseBrowser, realtimeChannels } from '@/lib/supabase';
import { Badge } from '@/components/primitives/Badge';
import { Star, MapPin, Clock, Navigation, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────

interface BookingData {
  id: string;
  reference: string;
  serviceType: string;
  status: string;
  address: { formattedAddress: string; latitude: number; longitude: number } | null;
  technician: {
    id: string;
    name: string;
    profileImage: string | null;
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

// ─── Status timeline ──────────────────────────────────────────

const STATUS_STEPS = [
  { key: 'CONFIRMED', label: 'Booking Confirmed' },
  { key: 'TECHNICIAN_ASSIGNED', label: 'Technician Assigned' },
  { key: 'TECHNICIAN_EN_ROUTE', label: 'Technician En Route' },
  { key: 'TECHNICIAN_ARRIVED', label: 'Technician Arrived' },
  { key: 'IN_PROGRESS', label: 'Service In Progress' },
  { key: 'COMPLETED', label: 'Service Completed' },
];

function getStepIndex(status: string) {
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

// ─── ETA calculation via Google Distance Matrix ────────────────

async function fetchETA(
  techLat: number, techLng: number,
  custLat: number, custLng: number
): Promise<{ distance: string; duration: string } | null> {
  try {
    const res = await fetch(
      `/api/eta?techLat=${techLat}&techLng=${techLng}&custLat=${custLat}&custLng=${custLng}`
    );
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

// ─── Main Client Component ────────────────────────────────────

export function LiveTrackingClient({ booking }: { booking: BookingData }) {
  const [status, setStatus] = React.useState(booking.status);
  const [techLocation, setTechLocation] = React.useState<{ lat: number; lng: number } | null>(
    booking.technician?.currentLatitude && booking.technician?.currentLongitude
      ? { lat: booking.technician.currentLatitude, lng: booking.technician.currentLongitude }
      : null
  );
  const [eta, setEta] = React.useState<{ distance: string; duration: string } | null>(null);
  const [lastUpdate, setLastUpdate] = React.useState<string | null>(null);
  const [mapReady, setMapReady] = React.useState(false);

  const customerPos = booking.address
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
        // Step 15% towards customer location
        const nextLat = prev.lat + (customerPos.lat - prev.lat) * 0.08;
        const nextLng = prev.lng + (customerPos.lng - prev.lng) * 0.08;
        return { lat: nextLat, lng: nextLng };
      });
      setLastUpdate(new Date().toLocaleTimeString('en-IN'));
    }, 4000);

    return () => clearInterval(interval);
  }, [booking.id, booking.reference, status, customerPos?.lat, customerPos?.lng]);

  // ── Supabase Realtime subscription ────────────────────────────
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
        setStatus(payload.payload.status);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
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
  }, [techLocation?.lat, techLocation?.lng, status]);

  const stepIndex = getStepIndex(status);
  const isTracking = status === 'TECHNICIAN_EN_ROUTE';
  const isCompleted = status === 'COMPLETED';

  return (
    <div className="min-h-screen bg-[#14110F]">
      {/* Header */}
      <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
        <div className="container-wl py-5">
          <span className="text-overline block mb-1">Live Tracking</span>
          <h1 className="font-display text-2xl text-[#EDE6D6]">{booking.serviceType}</h1>
          <p className="font-mono text-[10px] text-[rgba(237,230,214,0.35)] mt-0.5">{booking.reference}</p>
        </div>
      </div>

      <div className="container-wl py-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* ── Left: Map ── */}
        <div className="order-2 lg:order-1">
          {!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY' ? (
            <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] aspect-video flex items-center justify-center">
              <div className="text-center p-6">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                <p className="font-mono text-[10px] tracking-widest uppercase text-amber-400 mb-2">Google Maps API Key Required</p>
                <p className="text-sm text-[rgba(237,230,214,0.55)]">
                  Add <code className="text-[#B08D57]">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to .env.local
                </p>
                {booking.address && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-[rgba(237,230,214,0.50)]">
                    <MapPin className="w-4 h-4 text-[#B08D57]" />
                    {booking.address.formattedAddress}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <APIProvider apiKey={apiKey}>
              <div className="rounded-[2px] overflow-hidden border border-[rgba(176,141,87,0.10)] h-[420px]">
                <Map
                  defaultCenter={customerPos ?? { lat: 19.076, lng: 72.877 }}
                  defaultZoom={14}
                  mapId="wristloom-tracking"
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                >
                  {/* Customer marker */}
                  {customerPos && (
                    <AdvancedMarker position={customerPos} title="Service Location">
                      <Pin background="#B08D57" glyphColor="#14110F" borderColor="#8B6D3F" />
                    </AdvancedMarker>
                  )}

                  {/* Technician marker */}
                  {techLocation && isTracking && (
                    <AdvancedMarker
                      position={techLocation}
                      title={`${booking.technician?.name ?? 'Technician'} — Live Location`}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#6B2737] border-2 border-white flex items-center justify-center shadow-lg">
                        <Navigation className="w-4 h-4 text-white" />
                      </div>
                    </AdvancedMarker>
                  )}
                </Map>
              </div>
              {lastUpdate && (
                <p className="font-mono text-[9px] text-[rgba(237,230,214,0.35)] mt-1 text-right">
                  Last update: {lastUpdate}
                </p>
              )}
            </APIProvider>
          )}

          {/* ETA Card */}
          {isTracking && (
            <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-5 mt-4">
              {eta ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] mb-1">Estimated Arrival</p>
                    <p className="font-display text-3xl text-[#B08D57]">{eta.duration}</p>
                    <p className="text-xs text-[rgba(237,230,214,0.45)] mt-0.5">{eta.distance} away</p>
                  </div>
                  <Clock className="w-10 h-10 text-[rgba(176,141,87,0.25)]" />
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-[rgba(237,230,214,0.40)]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Calculating ETA...
                </div>
              )}
            </div>
          )}

          {isCompleted && (
            <div className="bg-emerald-900/20 border border-emerald-700/40 rounded-[2px] p-5 mt-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <p className="text-sm text-emerald-300">Service completed. Thank you for choosing Wristloom.</p>
            </div>
          )}
        </div>

        {/* ── Right: Info panels ── */}
        <div className="order-1 lg:order-2 space-y-4">
          {/* Technician card */}
          {booking.technician && (
            <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-5">
              <p className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] mb-3">Your Technician</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[rgba(176,141,87,0.10)] flex-shrink-0 border border-[rgba(176,141,87,0.20)]">
                  {booking.technician.profileImage ? (
                    <img src={booking.technician.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-display text-lg text-[#B08D57]">
                      {booking.technician.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-display text-base text-[#EDE6D6]">{booking.technician.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3 h-3 text-[#B08D57] fill-[#B08D57]" />
                    <span className="font-mono text-[10px] text-[rgba(237,230,214,0.55)]">{booking.technician.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {booking.technician.specializations.slice(0, 2).map((s) => (
                      <span key={s} className="font-mono text-[9px] text-[rgba(237,230,214,0.35)]">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status timeline */}
          <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-5">
            <p className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] mb-4">Service Progress</p>
            <div className="space-y-3">
              {STATUS_STEPS.map((step, i) => {
                const done = i < stepIndex;
                const active = i === stepIndex;
                return (
                  <div key={step.key} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border transition-colors ${
                      done ? 'bg-[#B08D57] border-[#B08D57]'
                        : active ? 'bg-transparent border-[#B08D57]'
                        : 'bg-transparent border-[rgba(237,230,214,0.12)]'
                    }`}>
                      {done && <CheckCircle className="w-3 h-3 text-[#14110F]" />}
                      {active && <div className="w-2 h-2 rounded-full bg-[#B08D57] animate-pulse" />}
                    </div>
                    <span className={`text-xs ${active ? 'text-[#EDE6D6] font-medium' : done ? 'text-[rgba(237,230,214,0.45)]' : 'text-[rgba(237,230,214,0.25)]'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Address */}
          {booking.address && (
            <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-5">
              <p className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] mb-2">Service Location</p>
              <p className="text-sm text-[rgba(237,230,214,0.65)] leading-relaxed">{booking.address.formattedAddress}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
