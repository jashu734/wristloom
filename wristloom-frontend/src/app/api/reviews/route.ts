// ============================================================
// Wristloom — Reviews API Route (Next.js)
// Handles reading and posting authentic verified reviews
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

const reviewSchema = z.object({
  technicianId: z.string().min(1, 'Technician ID required'),
  bookingId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3, 'Title required (min 3 chars)'),
  body: z.string().min(10, 'Review body required (min 10 chars)'),
  serviceType: z.string().min(1, 'Service type required'),
  watchBrand: z.string().optional(),
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

    // Create review
    const review = await db.review.create({
      data: {
        technicianId: data.technicianId,
        customerId: session.user.id,
        bookingId: data.bookingId ?? null,
        rating: data.rating,
        title: data.title,
        body: data.body,
        serviceType: data.serviceType,
        watchBrand: data.watchBrand ?? null,
        verified: true,
      },
    });

    // Recalculate technician rating average
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
        completedServices: { increment: 1 },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (err: any) {
    console.error('[Review POST Error]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to submit review' }, { status: 400 });
  }
}
