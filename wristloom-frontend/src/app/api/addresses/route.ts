// ============================================================
// Wristloom — Addresses API Route (Next.js)
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

const addressSchema = z.object({
  fullName: z.string(),
  phone: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  latitude: z.number().optional().default(0),
  longitude: z.number().optional().default(0),
  formattedAddress: z.string().optional(),
  isDefault: z.boolean().optional(),
});

async function geocodeQuery(query: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      {
        headers: { 'User-Agent': 'WristLoom-Horology-Platform/1.0 (contact@wristloom.luxury)' },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
      }
    }
  } catch {
    // Proceed silently on network timeout / failure
  }
  return null;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json([]);
    }

    const addresses = await db.address.findMany({
      where: { userId: session.user.id },
      orderBy: { isDefault: 'desc' },
    });

    return NextResponse.json(addresses);
  } catch (err: any) {
    console.error('[Addresses GET Error]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const data = addressSchema.parse(body);

    let userId = session?.user?.id;

    // If guest, find or create an anonymous/guest customer profile
    if (!userId) {
      const guestEmail = 'guest@wristloom.luxury';
      let guestUser = await db.user.findUnique({ where: { email: guestEmail } });
      if (!guestUser) {
        guestUser = await db.user.create({
          data: {
            name: data.fullName || 'Guest Customer',
            email: guestEmail,
            role: 'CUSTOMER',
            phone: data.phone,
          },
        });
      }
      userId = guestUser.id;
    }

    const formatted =
      data.formattedAddress ??
      [data.addressLine1, data.addressLine2, data.city, data.state, data.postalCode]
        .filter(Boolean)
        .join(', ');

    let latitude = data.latitude || 0;
    let longitude = data.longitude || 0;

    // If client did not provide GPS coordinates, geocode automatically
    if (latitude === 0 && longitude === 0) {
      const geoResult = await geocodeQuery(`${data.addressLine1}, ${data.city}, ${data.postalCode}`);
      if (geoResult) {
        latitude = geoResult.latitude;
        longitude = geoResult.longitude;
      } else {
        // Fallback to recognized metropolitan horological hubs
        const cityKey = data.city?.trim().toLowerCase();
        const cityCoords: Record<string, { lat: number; lng: number }> = {
          bangalore: { lat: 12.9716, lng: 77.5946 },
          bengaluru: { lat: 12.9716, lng: 77.5946 },
          mumbai: { lat: 19.0760, lng: 72.8777 },
          delhi: { lat: 28.6139, lng: 77.2090 },
          'new delhi': { lat: 28.6139, lng: 77.2090 },
          hyderabad: { lat: 17.3850, lng: 78.4867 },
          chennai: { lat: 13.0827, lng: 80.2707 },
          kolkata: { lat: 22.5726, lng: 88.3639 },
          pune: { lat: 18.5204, lng: 73.8567 },
          ahmedabad: { lat: 23.0225, lng: 72.5714 },
          jaipur: { lat: 26.9124, lng: 75.7873 },
          gurgaon: { lat: 28.4595, lng: 77.0266 },
          noida: { lat: 28.5355, lng: 77.3910 },
        };
        if (cityKey && cityCoords[cityKey]) {
          latitude = cityCoords[cityKey].lat;
          longitude = cityCoords[cityKey].lng;
        }
      }
    }

    const address = await db.address.create({
      data: {
        userId,
        fullName: data.fullName,
        phone: data.phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 ?? null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        latitude,
        longitude,
        formattedAddress: formatted,
        isDefault: data.isDefault ?? false,
      },
    });

    return NextResponse.json(address, { status: 201 });
  } catch (err: any) {
    console.error('[Addresses POST Error]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to save address' }, { status: 400 });
  }
}
