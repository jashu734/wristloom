// ============================================================
// Wristloom — Bookings API Route (Next.js)
// Server-validated pricing, slot capacity, address ownership, and load-balanced technician assignment
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { bookingLimiter } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/http';
import { calculateServicePrice } from '@/lib/pricing';
import { validateBookingSlot, findLeastLoadedTechnician } from '@/lib/booking-slots';
import { generateBookingReference, generateGuestEmail } from '@/lib/guest';
import { maskAddress, maskEmail, maskPhone } from '@/lib/privacy';

const bookingSchema = z.object({
  serviceType: z.string().min(1, 'Service type is required'),
  watchBrand: z.string().trim().max(100).optional(),
  watchModel: z.string().trim().max(100).optional(),
  watchReferenceNumber: z.string().trim().max(100).optional(),
  issueDescription: z.string().trim().max(2000).optional(),
  issueImages: z.array(z.string().max(2048)).optional().default([]),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  scheduledTimeStart: z.string().min(1, 'Start time is required'),
  scheduledTimeEnd: z.string().min(1, 'End time is required'),
  addressId: z.string().optional(),
  notes: z.string().trim().max(1000).optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json([]);
    }

    const isAdmin = session.user.role === 'ADMIN';
    const isTech = session.user.role === 'TECHNICIAN';

    let where: any = {};
    if (isAdmin) {
      where = {};
    } else if (isTech) {
      const tech = await db.technician.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
      if (tech) {
        where = { technicianId: tech.id };
      } else {
        where = { technician: { userId: session.user.id } };
      }
    } else {
      where = { customerId: session.user.id };
    }

    const bookings = await db.repairBooking.findMany({
      where,
      include: {
        address: true,
        customer: { select: { id: true, name: true, phone: true, email: true, profileImage: true } },
        technician: {
          include: {
            user: {
              select: { name: true, phone: true, profileImage: true },
            },
          },
        },
      },
      orderBy: { scheduledDate: 'desc' },
    });

    return NextResponse.json(bookings);
  } catch (err: any) {
    console.error('[Bookings GET Error]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limit = await bookingLimiter.check(10, ip);
    if (!limit.success) {
      return NextResponse.json(
        { error: 'Too many booking requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    const session = await auth();
    const body = await req.json();
    const data = bookingSchema.parse(body);

    // 1. Authoritative Server-Side Pricing Lookup
    let pricingInfo;
    try {
      pricingInfo = calculateServicePrice(data.serviceType);
    } catch (pricingErr: any) {
      return NextResponse.json({ error: pricingErr.message }, { status: 400 });
    }

    // 2. Validate Scheduled Date & Time Slot
    const requestedDate = new Date(data.scheduledDate);
    if (isNaN(requestedDate.getTime())) {
      return NextResponse.json({ error: 'Invalid scheduled date.' }, { status: 400 });
    }

    const slotCheck = await validateBookingSlot(
      requestedDate,
      data.scheduledTimeStart,
      data.scheduledTimeEnd
    );
    if (!slotCheck.valid) {
      return NextResponse.json({ error: slotCheck.error }, { status: 400 });
    }

    let customerId = session?.user?.id;

    // 3. If guest, ensure an isolated unique guest profile
    if (!customerId) {
      if (data.addressId) {
        const address = await db.address.findUnique({
          where: { id: data.addressId },
          select: { userId: true },
        });
        if (address?.userId) {
          customerId = address.userId;
        }
      }

      if (!customerId) {
        const guestEmail = generateGuestEmail();
        const guestUser = await db.user.create({
          data: {
            name: 'Guest Customer',
            email: guestEmail,
            role: 'CUSTOMER',
          },
        });
        customerId = guestUser.id;
      }
    }

    // 4. Validate Address Ownership if addressId provided
    if (data.addressId) {
      const address = await db.address.findUnique({
        where: { id: data.addressId },
      });
      if (!address || (session?.user?.id && address.userId !== session.user.id)) {
        return NextResponse.json({ error: 'Invalid or unauthorized delivery address.' }, { status: 400 });
      }
    }

    // 5. Load-balanced Technician Assignment (lowest active queue)
    const assignedTechnicianId = await findLeastLoadedTechnician();

    const bookingRef = generateBookingReference();

    const booking = await db.repairBooking.create({
      data: {
        bookingReference: bookingRef,
        customerId,
        technicianId: assignedTechnicianId,
        serviceType: pricingInfo.serviceName,
        watchBrand: data.watchBrand,
        watchModel: data.watchModel,
        watchReferenceNumber: data.watchReferenceNumber,
        issueDescription: data.issueDescription,
        issueImages: data.issueImages,
        scheduledDate: requestedDate,
        scheduledTimeStart: data.scheduledTimeStart,
        scheduledTimeEnd: data.scheduledTimeEnd,
        addressId: data.addressId ?? null,
        estimatedPrice: pricingInfo.basePrice,
        depositAmount: pricingInfo.depositAmount,
        notes: data.notes,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
      },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        address: true,
      },
    });

    // Notify customer in-app
    if (session?.user?.id) {
      await db.notification.create({
        data: {
          userId: session.user.id,
          bookingId: booking.id,
          type: 'BOOKING_CONFIRMED',
          title: 'Appointment Requested',
          body: `Service request #${booking.bookingReference} for ${pricingInfo.serviceName} submitted. Deposit of ₹${pricingInfo.depositAmount.toLocaleString('en-IN')} pending.`,
        },
      }).catch((e: any) => console.warn('Booking notification note:', e));
    }

    // Mask guest response if anonymous
    const responseBooking = session?.user?.id
      ? booking
      : {
          ...booking,
          customer: {
            ...booking.customer,
            email: maskEmail(booking.customer.email),
            phone: maskPhone(booking.customer.phone),
          },
          address: maskAddress(booking.address),
        };

    return NextResponse.json(responseBooking, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message ?? 'Validation failed' }, { status: 400 });
    }
    console.error('[Bookings POST Error]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to create booking' }, { status: 400 });
  }
}
