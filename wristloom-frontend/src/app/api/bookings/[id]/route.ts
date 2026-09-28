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
            user: { select: { id: true, name: true, phone: true } },
          },
        },
      },
    });

    // Realtime broadcast to tracking channel
    if (status && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createServerClient, realtimeChannels } = await import('@/lib/supabase');
        const supabase = createServerClient();
        await supabase.channel(realtimeChannels.bookingLocation(id)).send({
          type: 'broadcast',
          event: 'status_update',
          payload: { status },
        });
      } catch (e) {
        console.warn('[Status Broadcast Warning]', e);
      }
    }

    // Trigger Notification for Customer
    if (status && updated.customerId) {
      const statusTitles: Record<string, { title: string; body: string; type: any }> = {
        CONFIRMED: {
          title: 'Booking Confirmed',
          body: `Your booking #${updated.bookingReference} is confirmed.`,
          type: 'BOOKING_CONFIRMED',
        },
        TECHNICIAN_ASSIGNED: {
          title: 'Technician Assigned',
          body: `${updated.technician?.user.name ?? 'A certified technician'} has been assigned to your service.`,
          type: 'TECHNICIAN_ASSIGNED',
        },
        TECHNICIAN_EN_ROUTE: {
          title: 'Technician En Route',
          body: `${updated.technician?.user.name ?? 'Your technician'} is on the way to your location. Track live on your radar!`,
          type: 'TECHNICIAN_EN_ROUTE',
        },
        TECHNICIAN_ARRIVED: {
          title: 'Technician Arrived',
          body: 'Your technician has arrived at your address.',
          type: 'TECHNICIAN_ARRIVED',
        },
        IN_PROGRESS: {
          title: 'Service in Progress',
          body: `Diagnostic & repair work has commenced on your ${updated.watchBrand || 'timepiece'}.`,
          type: 'SERVICE_IN_PROGRESS',
        },
        COMPLETED: {
          title: 'Service Completed',
          body: `Restoration for #${updated.bookingReference} is complete. Your timepiece has been regulated & sealed.`,
          type: 'SERVICE_COMPLETED',
        },
      };

      const notifInfo = statusTitles[status];
      if (notifInfo) {
        await db.notification.create({
          data: {
            userId: updated.customerId,
            bookingId: updated.id,
            type: notifInfo.type,
            title: notifInfo.title,
            body: notifInfo.body,
          },
        }).catch((err) => console.warn('Notification creation warning:', err));
      }
    }

    // If technician assigned, notify technician user
    if (technicianId && updated.technician?.user?.id) {
      await db.notification.create({
        data: {
          userId: updated.technician.user.id,
          bookingId: updated.id,
          type: 'NEW_BOOKING_ASSIGNED',
          title: 'New Service Job Assigned',
          body: `You have been assigned to service booking #${updated.bookingReference}.`,
        },
      }).catch((err) => console.warn('Tech notification warning:', err));
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('[Booking PATCH Error]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to update booking' }, { status: 500 });
  }
}
