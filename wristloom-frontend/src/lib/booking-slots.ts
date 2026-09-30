// ============================================================
// Wristloom — Booking Slots & Capacity Helper
// Validates requested booking dates, timeslots and availability
// ============================================================

import { db } from '@/lib/db';

export const VALID_SLOTS = [
  { start: '10:00', end: '12:00' },
  { start: '12:00', end: '14:00' },
  { start: '14:00', end: '16:00' },
  { start: '16:00', end: '18:00' },
  { start: '18:00', end: '20:00' },
];

export async function validateBookingSlot(
  scheduledDate: Date,
  scheduledTimeStart: string,
  _scheduledTimeEnd: string
): Promise<{ valid: boolean; error?: string }> {
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const requestedMidnight = new Date(
    scheduledDate.getFullYear(),
    scheduledDate.getMonth(),
    scheduledDate.getDate()
  );

  if (requestedMidnight < todayMidnight) {
    return { valid: false, error: 'Cannot book appointments in the past.' };
  }

  // If today, ensure the time slot is at least 2 hours in the future
  if (requestedMidnight.getTime() === todayMidnight.getTime()) {
    const [startH] = scheduledTimeStart.split(':').map(Number);
    if (startH <= now.getHours() + 1) {
      return { valid: false, error: 'Appointment slot must be at least 2 hours from now.' };
    }
  }

  // Check maximum active bookings on that slot across active technicians
  const dayStart = new Date(requestedMidnight);
  const dayEnd = new Date(requestedMidnight);
  dayEnd.setHours(23, 59, 59, 999);

  const existingBookingsCount = await db.repairBooking.count({
    where: {
      scheduledDate: { gte: dayStart, lte: dayEnd },
      scheduledTimeStart,
      status: { notIn: ['CANCELLED', 'COMPLETED'] },
    },
  });

  const verifiedTechCount = await db.technician.count({
    where: { isVerified: true, isAvailable: true },
  });

  // Capacity cap: each slot cannot exceed the number of available technicians
  const capacity = Math.max(1, verifiedTechCount * 2);
  if (existingBookingsCount >= capacity) {
    return {
      valid: false,
      error: 'Selected time slot has reached maximum atelier capacity. Please select another slot.',
    };
  }

  return { valid: true };
}

export async function findLeastLoadedTechnician(): Promise<string | null> {
  const technicians = await db.technician.findMany({
    where: { isVerified: true, isAvailable: true },
    select: {
      id: true,
      _count: {
        select: {
          bookings: {
            where: { status: { in: ['CONFIRMED', 'TECHNICIAN_ASSIGNED', 'TECHNICIAN_EN_ROUTE', 'IN_PROGRESS'] } },
          },
        },
      },
    },
  });

  if (technicians.length === 0) return null;

  // Sort by lowest active booking count
  technicians.sort((a, b) => a._count.bookings - b._count.bookings);
  return technicians[0].id;
}
