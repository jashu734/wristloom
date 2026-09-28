// ============================================================
// Wristloom — Bookings API Route (Next.js)
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

const bookingSchema = z.object({
  serviceType: z.string(),
  watchBrand: z.string().optional(),
  watchModel: z.string().optional(),
  watchReferenceNumber: z.string().optional(),
  issueDescription: z.string().optional(),
  issueImages: z.array(z.string()).optional().default([]),
  scheduledDate: z.string(),
  scheduledTimeStart: z.string(),
  scheduledTimeEnd: z.string(),
  addressId: z.string().optional(),
  estimatedPrice: z.number().optional(),
  depositAmount: z.number().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json([]);
    }

    const bookings = await db.repairBooking.findMany({
      where: { customerId: session.user.id },
      include: {
        address: true,
        technician: {
          include: {
            user: {
              select: { name: true, phone: true, profileImage: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(bookings);
  } catch (err: any) {
    console.error('[Bookings GET Error]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const data = bookingSchema.parse(body);

    let customerId = session?.user?.id;

    // If guest, find or create an anonymous/guest customer profile
    if (!customerId) {
      const guestEmail = 'guest@wristloom.luxury';
      let guestUser = await db.user.findUnique({ where: { email: guestEmail } });
      if (!guestUser) {
        guestUser = await db.user.create({
          data: {
            name: 'Guest Customer',
            email: guestEmail,
            role: 'CUSTOMER',
          },
        });
      }
      customerId = guestUser.id;
    }

    // Auto-assign first available verified technician if available
    const availableTech = await db.technician.findFirst({
      where: { isVerified: true, isAvailable: true },
    });

    const bookingRef = `WL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const booking = await db.repairBooking.create({
      data: {
        bookingReference: bookingRef,
        customerId,
        technicianId: availableTech?.id ?? null,
        serviceType: data.serviceType,
        watchBrand: data.watchBrand,
        watchModel: data.watchModel,
        watchReferenceNumber: data.watchReferenceNumber,
        issueDescription: data.issueDescription,
        issueImages: data.issueImages,
        scheduledDate: new Date(data.scheduledDate),
        scheduledTimeStart: data.scheduledTimeStart,
        scheduledTimeEnd: data.scheduledTimeEnd,
        addressId: data.addressId ?? null,
        estimatedPrice: data.estimatedPrice,
        depositAmount: data.depositAmount,
        notes: data.notes,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (err: any) {
    console.error('[Bookings POST Error]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to create booking' }, { status: 400 });
  }
}
