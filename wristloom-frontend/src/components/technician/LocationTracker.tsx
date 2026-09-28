'use client';

import * as React from 'react';

interface Props {
  bookingId: string;
  technicianId: string;
}

const INTERVAL_MS = 10_000; // Send location every 10 seconds

export function LocationTracker({ bookingId, technicianId }: Props) {
  const watchIdRef = React.useRef<number | null>(null);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPositionRef = React.useRef<GeolocationPosition | null>(null);
  const [status, setStatus] = React.useState<'requesting' | 'active' | 'denied' | 'stopped'>('requesting');

  React.useEffect(() => {
    if (!('geolocation' in navigator)) {
      setStatus('denied');
      return;
    }

    // 1. Watch position continuously
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        lastPositionRef.current = position;
        setStatus('active');
      },
      (err) => {
        console.error('[LocationTracker] watchPosition error:', err);
        setStatus('denied');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5_000,
        timeout: 15_000,
      }
    );

    // 2. Send to backend every INTERVAL_MS
    intervalRef.current = setInterval(async () => {
      const pos = lastPositionRef.current;
      if (!pos) return;

      try {
        const res = await fetch('/api/location/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            heading: pos.coords.heading ?? undefined,
            speed: pos.coords.speed ?? undefined,
          }),
        });

        const data = await res.json();
        // If server says stop tracking (booking no longer en route)
        if (data?.stop === true) {
          setStatus('stopped');
          clearAll();
        }
      } catch (err) {
        console.error('[LocationTracker] send error:', err);
      }
    }, INTERVAL_MS);

    return () => clearAll();
  }, [bookingId]);

  function clearAll() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  // Render a small status banner — invisible to customer
  if (status === 'denied') {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-red-900/80 border border-red-700 rounded-[2px] px-4 py-3 text-xs text-red-200 max-w-xs">
        <strong className="block mb-1">Location access required</strong>
        Location access is required while travelling to an active customer booking.
        Please enable location permissions in your browser settings and refresh.
      </div>
    );
  }

  if (status === 'active') {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-emerald-900/70 border border-emerald-700/50 rounded-[2px] px-4 py-2 text-xs text-emerald-300 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
        Live tracking active
      </div>
    );
  }

  return null;
}
