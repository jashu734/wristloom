// ============================================================
// Wristloom — Estimated Arrival & Distance Matrix API
// Protected against open quota exhaustion with auth & coordinate validation
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { rateLimiter } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/http';

const etaLimiter = rateLimiter({ interval: 60_000, uniqueTokenPerInterval: 500 });

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const ip = getClientIp(request);
    const limit = await etaLimiter.check(30, ip);
    if (!limit.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const techLat = parseFloat(searchParams.get('techLat') ?? '');
    const techLng = parseFloat(searchParams.get('techLng') ?? '');
    const custLat = parseFloat(searchParams.get('custLat') ?? '');
    const custLng = parseFloat(searchParams.get('custLng') ?? '');

    if (!isValidCoordinate(techLat, techLng) || !isValidCoordinate(custLat, custLng)) {
      return NextResponse.json({ error: 'Invalid coordinate parameters' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (apiKey) {
      try {
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${techLat},${techLng}&destinations=${custLat},${custLng}&key=${apiKey}&mode=driving`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.status === 'OK' && data.rows?.[0]?.elements?.[0]?.status === 'OK') {
          const element = data.rows[0].elements[0];
          return NextResponse.json({
            distance: element.distance.text,
            duration: element.duration.text,
          });
        }
      } catch (err) {
        console.warn('Google Distance Matrix failed, falling back to calculation:', err);
      }
    }

    // Intelligent urban transit fallback
    const directKm = haversineDistance(techLat, techLng, custLat, custLng);
    const drivingKm = Math.max(0.4, directKm * 1.35);
    const minutes = Math.max(3, Math.round((drivingKm / 22) * 60));

    const distanceText =
      drivingKm < 1 ? `${Math.round(drivingKm * 1000)} m` : `${drivingKm.toFixed(1)} km`;

    const durationText = `${minutes} min${minutes === 1 ? '' : 's'}`;

    return NextResponse.json({
      distance: distanceText,
      duration: durationText,
    });
  } catch (err: any) {
    console.error('[ETA Route Error]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to compute ETA' }, { status: 500 });
  }
}
