// ============================================================
// Wristloom — Technician Location Update API Route (Next.js)
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId, latitude, longitude, accuracy, heading, speed } = body;

    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json({ error: 'Valid latitude (-90 to 90) and longitude (-180 to 180) are required' }, { status: 400 });
    }

    // Identify the technician
    let technicianId: string | null = null;
    const tech = await db.technician.findUnique({ where: { userId: session.user.id } });
    if (tech) {
      technicianId = tech.id;
    } else if (session.user.role === 'ADMIN' && bookingId) {
      const booking = await db.repairBooking.findUnique({ where: { id: bookingId } });
      technicianId = booking?.technicianId ?? null;
    }

    if (!technicianId) {
      return NextResponse.json({ error: 'Forbidden: Only active technicians can report location' }, { status: 403 });
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

      // Broadcast location to Supabase Realtime channel for live customer radar
      if (bookingId && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          const { createServerClient, realtimeChannels } = await import('@/lib/supabase');
          const supabase = createServerClient();
          await supabase.channel(realtimeChannels.bookingLocation(bookingId)).send({
            type: 'broadcast',
            event: 'location_update',
            payload: {
              latitude,
              longitude,
              accuracy: accuracy || null,
              recordedAt: new Date().toISOString(),
            },
          });
        } catch (realtimeErr) {
          console.warn('[Realtime Broadcast Warning]', realtimeErr);
        }
      }
    }

    return NextResponse.json({ success: true, latitude, longitude, technicianId });
  } catch (err: any) {
    console.error('[Location Update Error]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to update location' }, { status: 500 });
  }
}
