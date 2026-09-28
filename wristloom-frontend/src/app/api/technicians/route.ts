// ============================================================
// Wristloom — Technicians API Route (Next.js)
// ============================================================
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const technicians = await db.technician.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            profileImage: true,
          },
        },
      },
    });

    if (technicians.length > 0) {
      return NextResponse.json(technicians);
    }

    // Default fallback roster if no technicians in DB
    const fallback = [
      {
        id: 'tech_marcus',
        userId: 'u_marcus',
        specialties: ['Complications', 'Tourbillons', 'Rolex Certified'],
        experienceYears: 18,
        rating: 4.96,
        totalJobs: 342,
        isAvailable: true,
        currentLatitude: 12.9716,
        currentLongitude: 77.5946,
        user: {
          name: 'Marcus Vance',
          phone: '+91 98765 43210',
          profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        },
      },
      {
        id: 'tech_elena',
        userId: 'u_elena',
        specialties: ['Chronographs', 'Patek Philippe Specialist', 'Vintage Restoration'],
        experienceYears: 14,
        rating: 4.92,
        totalJobs: 289,
        isAvailable: true,
        currentLatitude: 12.9815,
        currentLongitude: 77.6000,
        user: {
          name: 'Elena Rostova',
          phone: '+91 98765 43211',
          profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        },
      },
    ];

    return NextResponse.json(fallback);
  } catch (err: any) {
    console.error('[Technicians GET Error]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to fetch technicians' }, { status: 500 });
  }
}
