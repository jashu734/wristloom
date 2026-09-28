// ============================================================
// Wristloom — Booking Availability API Route (Next.js)
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const ALL_SLOTS = [
  { start: '09:00', end: '11:00', label: '9:00 AM – 11:00 AM' },
  { start: '11:00', end: '13:00', label: '11:00 AM – 1:00 PM' },
  { start: '14:00', end: '16:00', label: '2:00 PM – 4:00 PM' },
  { start: '16:00', end: '18:00', label: '4:00 PM – 6:00 PM' },
];

const MIN_CAPACITY = 3;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get('date');

  if (!dateStr) {
    return NextResponse.json({ error: 'date parameter is required' }, { status: 400 });
  }

  try {
    const date = new Date(dateStr);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const bookings = await db.repairBooking.findMany({
      where: {
        scheduledDate: { gte: dayStart, lte: dayEnd },
        status: { notIn: ['CANCELLED'] },
      },
      select: { scheduledTimeStart: true },
    });

    const techCount = await db.technician.count({
      where: { isVerified: true, isAvailable: true },
    });

    const capacity = Math.max(techCount, MIN_CAPACITY);

    const slots = ALL_SLOTS.map((slot) => {
      const booked = bookings.filter((b) => b.scheduledTimeStart === slot.start).length;
      return {
        ...slot,
        available: booked < capacity,
        remaining: Math.max(0, capacity - booked),
      };
    });

    return NextResponse.json({ date: dateStr, slots });
  } catch (err: any) {
    console.error('[Availability GET Error]', err);
    // Graceful fallback with open slots
    const slots = ALL_SLOTS.map((s) => ({ ...s, available: true, remaining: MIN_CAPACITY }));
    return NextResponse.json({ date: dateStr, slots });
  }
}
