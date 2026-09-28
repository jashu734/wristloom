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
        latitude: data.latitude,
        longitude: data.longitude,
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
