// ============================================================
// Wristloom — Single Booking API Route (Next.js)
// Handles GET and PATCH for booking status updates
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const booking = await db.repairBooking.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        address: true,
        technician: {
          include: {
            user: { select: { name: true, phone: true, profileImage: true } },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (err: any) {
    console.error('[Booking GET Error]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to load booking' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { status, notes, technicianId } = body;

    const data: Record<string, any> = {};
    if (status) data.status = status;
    if (notes !== undefined) data.notes = notes;
    if (technicianId) data.technicianId = technicianId;

    const updated = await db.repairBooking.update({
      where: { id },
      data,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        technician: {
          include: {
            user: { select: { name: true, phone: true } },
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('[Booking PATCH Error]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to update booking' }, { status: 500 });
  }
}
