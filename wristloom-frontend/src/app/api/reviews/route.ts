// ============================================================
// Wristloom — Reviews API Route (Next.js)
// Handles reading and posting authentic verified reviews
// Prevents duplicate spam and unearned service count increments
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { isUserAdmin } from '@/lib/roles';

const reviewSchema = z.object({
  technicianId: z.string().min(1, 'Technician ID required'),
  bookingId: z.string().min(1, 'A valid completed booking reference is required to review'),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(3, 'Title required (min 3 chars)').max(120),
  body: z.string().trim().min(10, 'Review body required (min 10 chars)').max(2000),
  serviceType: z.string().trim().min(1, 'Service type required').max(100),
  watchBrand: z.string().trim().max(100).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const techId = searchParams.get('technicianId');

    const reviews = await db.review.findMany({
      where: {
        verified: true,
        ...(techId ? { technicianId: techId } : {}),
      },
      include: {
        customer: { select: { name: true, profileImage: true } },
        technician: {
          include: {
            user: { select: { name: true, profileImage: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(reviews);
  } catch (err: any) {
    console.error('[Reviews GET Error]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to load reviews' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'You must be signed in to leave a review' }, { status: 401 });
    }

    const body = await req.json();
    const data = reviewSchema.parse(body);

    // Verify technician exists
    const technician = await db.technician.findUnique({
      where: { id: data.technicianId },
    });
    if (!technician) {
      return NextResponse.json({ error: 'Technician not found' }, { status: 404 });
    }

    // Check that caller had a COMPLETED booking with this technician
    const isAdmin = isUserAdmin(session.user);
    const booking = await db.repairBooking.findFirst({
      where: {
        id: data.bookingId,
        technicianId: data.technicianId,
        ...(isAdmin ? {} : { customerId: session.user.id }),
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'No matching service booking found for this technician.' },
        { status: 404 }
      );
    }

    if (booking.status !== 'COMPLETED' && !isAdmin) {
      return NextResponse.json(
        { error: 'Reviews can only be submitted after the service has been completed.' },
        { status: 400 }
      );
    }

    // Check for existing review for this booking to prevent review spamming
    const existingReview = await db.review.findFirst({
      where: { bookingId: data.bookingId },
    });
    if (existingReview) {
      return NextResponse.json(
        { error: 'A review has already been submitted for this service appointment.' },
        { status: 409 }
      );
    }

    // Create authentic verified review
    const review = await db.review.create({
      data: {
        technicianId: data.technicianId,
        customerId: session.user.id,
        bookingId: data.bookingId,
        rating: data.rating,
        title: data.title,
        body: data.body,
        serviceType: data.serviceType || booking.serviceType,
        watchBrand: data.watchBrand || booking.watchBrand || null,
        verified: true,
      },
    });

    // Recalculate technician rating average accurately without inflating completedServices
    const allTechReviews = await db.review.findMany({
      where: { technicianId: data.technicianId },
      select: { rating: true },
    });

    const avgRating =
      allTechReviews.length > 0
        ? allTechReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / allTechReviews.length
        : data.rating;

    await db.technician.update({
      where: { id: data.technicianId },
      data: {
        rating: Math.round(avgRating * 100) / 100,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message ?? 'Invalid review data' }, { status: 400 });
    }
    console.error('[Review POST Error]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to submit review' }, { status: 500 });
  }
}
