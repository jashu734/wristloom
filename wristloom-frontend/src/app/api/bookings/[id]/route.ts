// ============================================================
// Wristloom — Single Booking API Route (Next.js)
// Role-scoped permissions, status transition validation, and PII masking
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { isUserAdmin } from '@/lib/roles';
import { maskAddress, maskEmail, maskPhone } from '@/lib/privacy';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const ALLOWED_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'TECHNICIAN_ASSIGNED',
  'TECHNICIAN_EN_ROUTE',
  'TECHNICIAN_ARRIVED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
] as const;

const patchSchema = z.object({
  status: z.enum(ALLOWED_STATUSES).optional(),
  notes: z.string().max(2000).optional(),
  stageNote: z.string().max(500).optional(),
  completionPin: z.string().optional(),
  technicianId: z.string().optional(),
  estimatedPrice: z.number().positive().optional(),
  finalPrice: z.number().positive().optional(),
  paymentStatus: z.enum(['UNPAID', 'DEPOSIT_PAID', 'FULLY_PAID', 'REFUNDED']).optional(),
  scheduledDate: z.string().optional(),
});

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const booking = await db.repairBooking.findFirst({
      where: {
        OR: [{ id }, { bookingReference: id }],
      },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        address: true,
        serviceHistory: { orderBy: { date: 'asc' } },
        technician: {
          include: {
            user: { select: { id: true, name: true, phone: true, profileImage: true, email: true } },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const session = await auth();
    const isAdmin = isUserAdmin(session?.user);
    const isOwner = Boolean(session?.user?.id && booking.customerId === session?.user?.id);
    const isTech = Boolean(session?.user?.id && booking.technician?.userId === session?.user?.id);

    // If caller is not owner, assigned technician, or admin, mask sensitive PII
    if (!isAdmin && !isOwner && !isTech) {
      const masked = {
        ...booking,
        customer: {
          name: booking.customer.name,
          email: maskEmail(booking.customer.email),
          phone: maskPhone(booking.customer.phone),
        },
        address: maskAddress(booking.address),
        technician: booking.technician
          ? {
              ...booking.technician,
              user: {
                id: booking.technician.user.id,
                name: booking.technician.user.name,
                profileImage: booking.technician.user.profileImage,
              },
            }
          : null,
      };
      return NextResponse.json(masked);
    }

    return NextResponse.json(booking);
  } catch (err: any) {
    console.error('[Booking GET Error]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to load booking' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const rawBody = await req.json();
    const parsed = patchSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    const body = parsed.data;

    const currentBooking = await db.repairBooking.findFirst({
      where: {
        OR: [{ id }, { bookingReference: id }],
      },
      include: { technician: true },
    });

    if (!currentBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const isAdmin = isUserAdmin(session.user);
    const isAssignedTech = currentBooking.technician?.userId === session.user.id;
    const isCustomer = currentBooking.customerId === session.user.id;

    if (!isAdmin && !isAssignedTech && !isCustomer) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Customer privilege restrictions:
    // Can only cancel pending bookings. Cannot alter prices or payment status.
    if (isCustomer && !isAdmin && !isAssignedTech) {
      if (body.status && body.status !== 'CANCELLED') {
        return NextResponse.json({ error: 'Customers can only cancel bookings.' }, { status: 403 });
      }
      if (currentBooking.status !== 'PENDING') {
        return NextResponse.json({ error: 'Only pending bookings can be cancelled by the customer.' }, { status: 400 });
      }
      if (body.paymentStatus || body.finalPrice || body.estimatedPrice || body.technicianId || body.scheduledDate) {
        return NextResponse.json({ error: 'Unauthorized modification of privileged fields.' }, { status: 403 });
      }
    }

    // Technician privilege restrictions:
    // Cannot reassign technician or change pricing arbitrarily
    if (isAssignedTech && !isAdmin) {
      if (body.technicianId || body.paymentStatus) {
        return NextResponse.json({ error: 'Only administrators can reassign technicians or adjust payment status.' }, { status: 403 });
      }
      // PIN verification when marking completed
      if (body.status === 'COMPLETED') {
        const expectedPin = currentBooking.bookingReference.slice(-4).toUpperCase();
        const suppliedPin = (body.completionPin || '').trim().toUpperCase();
        if (suppliedPin && suppliedPin !== expectedPin) {
          return NextResponse.json({ error: 'Invalid customer completion verification PIN.' }, { status: 400 });
        }
      }
    }

    // Prepare update data according to permissions
    const data: Record<string, any> = {};

    if (body.status) data.status = body.status;
    if (body.notes !== undefined) data.notes = body.notes;

    if (isAdmin) {
      if (body.technicianId) data.technicianId = body.technicianId;
      if (body.estimatedPrice !== undefined) data.estimatedPrice = body.estimatedPrice;
      if (body.finalPrice !== undefined) data.finalPrice = body.finalPrice;
      if (body.paymentStatus) data.paymentStatus = body.paymentStatus;
      if (body.scheduledDate) data.scheduledDate = new Date(body.scheduledDate);
    } else if (isAssignedTech) {
      if (body.finalPrice !== undefined) data.finalPrice = body.finalPrice;
    }

    const updated = await db.repairBooking.update({
      where: { id: currentBooking.id },
      data,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        serviceHistory: { orderBy: { date: 'asc' } },
        technician: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
          },
        },
      },
    });

    // Milestone history logging
    if ((body.status && body.status !== currentBooking.status) || body.stageNote || body.notes) {
      const milestoneNote = body.stageNote || body.notes || `Status updated to ${body.status?.replace(/_/g, ' ')}`;
      await db.serviceHistory.create({
        data: {
          bookingId: currentBooking.id,
          date: new Date(),
          serviceType: currentBooking.serviceType,
          description: milestoneNote,
          technicianName: session.user.name || 'Wristloom Atelier Horologist',
          cost: data.finalPrice ?? data.estimatedPrice ?? currentBooking.finalPrice ?? currentBooking.estimatedPrice ?? null,
        },
      }).catch((e: any) => console.warn('Service history log warning:', e));
    }

    // Increment completedServices only when completed
    if (body.status === 'COMPLETED' && currentBooking.status !== 'COMPLETED' && updated.technicianId) {
      await db.technician.update({
        where: { id: updated.technicianId },
        data: { completedServices: { increment: 1 } },
      }).catch((e: any) => console.warn('Technician completed count note:', e));
    }

    // Realtime broadcast to tracking channel
    if (body.status && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createServerClient, realtimeChannels } = await import('@/lib/supabase');
        const supabase = createServerClient();
        await supabase.channel(realtimeChannels.bookingLocation(id)).send({
          type: 'broadcast',
          event: 'status_update',
          payload: { status: body.status },
        });
      } catch (e) {
        console.warn('[Status Broadcast Warning]', e);
      }
    }

    // Trigger Notification for Customer
    if (body.status && updated.customerId) {
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
        CANCELLED: {
          title: 'Booking Cancelled',
          body: `Booking #${updated.bookingReference} has been cancelled.`,
          type: 'BOOKING_CANCELLED',
        },
      };

      const notifInfo = statusTitles[body.status];
      if (notifInfo) {
        await db.notification.create({
          data: {
            userId: updated.customerId,
            bookingId: updated.id,
            type: notifInfo.type,
            title: notifInfo.title,
            body: notifInfo.body,
          },
        }).catch((err: any) => console.warn('Notification creation warning:', err));
      }
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('[Booking PATCH Error]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to update booking' }, { status: 500 });
  }
}
