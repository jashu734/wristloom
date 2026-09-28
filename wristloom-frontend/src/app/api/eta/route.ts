import { NextResponse } from 'next/server';

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const techLat = parseFloat(searchParams.get('techLat') ?? '');
  const techLng = parseFloat(searchParams.get('techLng') ?? '');
  const custLat = parseFloat(searchParams.get('custLat') ?? '');
  const custLng = parseFloat(searchParams.get('custLng') ?? '');

  if (isNaN(techLat) || isNaN(techLng) || isNaN(custLat) || isNaN(custLng)) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  const apiKey =
    process.env.GOOGLE_MAPS_SERVER_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (apiKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${techLat},${techLng}&destinations=${custLat},${custLng}&key=${apiKey}&mode=driving`;
      const res = await fetch(url);
      const data = await res.json();

      if (
        data.status === 'OK' &&
        data.rows?.[0]?.elements?.[0]?.status === 'OK'
      ) {
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

  // Intelligent urban transit fallback (assuming route factor 1.3x and 22 km/h city traffic)
  const directKm = haversineDistance(techLat, techLng, custLat, custLng);
  const drivingKm = Math.max(0.4, directKm * 1.35);
  const minutes = Math.max(3, Math.round((drivingKm / 22) * 60));

  const distanceText =
    drivingKm < 1
      ? `${Math.round(drivingKm * 1000)} m`
      : `${drivingKm.toFixed(1)} km`;

  const durationText = `${minutes} min${minutes === 1 ? '' : 's'}`;

  return NextResponse.json({
    distance: distanceText,
    duration: durationText,
  });
}
