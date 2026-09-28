// ============================================================
// Wristloom — Technician Location Update API Route (Next.js)
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const { bookingId, latitude, longitude, accuracy, heading, speed } = body;

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: 'latitude and longitude are required' }, { status: 400 });
    }

    // Try to find technician linked to current user or active booking
    let technicianId: string | null = null;
    if (session?.user?.id) {
      const tech = await db.technician.findUnique({ where: { userId: session.user.id } });
      if (tech) technicianId = tech.id;
    }

    if (!technicianId && bookingId) {
      const booking = await db.repairBooking.findUnique({ where: { id: bookingId } });
      technicianId = booking?.technicianId ?? null;
    }

    if (!technicianId) {
      // Find default technician
      const firstTech = await db.technician.findFirst();
      technicianId = firstTech?.id ?? null;
    }

    if (technicianId) {
      // Update current coordinates on technician
      await db.technician.update({
        where: { id: technicianId },
        data: {
          currentLatitude: latitude,
          currentLongitude: longitude,
          lastLocationUpdate: new Date(),
        },
      });

      // Record location history
      await db.technicianLocation.create({
        data: {
          technicianId,
          bookingId: bookingId || null,
          latitude,
          longitude,
          accuracy: accuracy || null,
          heading: heading || null,
          speed: speed || null,
        },
      });
    }

    return NextResponse.json({ success: true, latitude, longitude, technicianId });
  } catch (err: any) {
    console.error('[Location Update Error]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to update location' }, { status: 500 });
  }
}
