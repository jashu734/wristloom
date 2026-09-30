// ============================================================
// Wristloom — Technicians API Route (Next.js)
// ============================================================
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    const isAdmin = session?.user?.role === 'ADMIN';

    const technicians = await db.technician.findMany({
      select: {
        id: true,
        userId: true,
        bio: true,
        yearsExperience: true,
        specializations: true,
        certifications: true,
        brandsServiced: true,
        rating: true,
        completedServices: true,
        serviceRadiusKm: true,
        isVerified: true,
        isAvailable: true,
        currentLatitude: true,
        currentLongitude: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            profileImage: true,
            email: isAdmin,
            phone: isAdmin,
          },
        },
      },
      orderBy: { rating: 'desc' },
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
          phone: isAdmin ? '+91 98765 43210' : undefined,
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
          phone: isAdmin ? '+91 98765 43211' : undefined,
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

import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const createTechSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(6, 'Phone is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  specializations: z.array(z.string()).default(['Certified Horologist']),
  yearsExperience: z.number().int().default(5),
  bio: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createTechSchema.parse(body);

    // Check if user already exists
    const existing = await db.user.findUnique({ where: { email: parsed.email } });
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.password, 12);

    const user = await db.user.create({
      data: {
        name: parsed.name,
        email: parsed.email.toLowerCase().trim(),
        phone: parsed.phone,
        passwordHash,
        role: 'TECHNICIAN',
        technician: {
          create: {
            specializations: parsed.specializations,
            yearsExperience: parsed.yearsExperience,
            bio: parsed.bio || 'Wristloom Certified Master Watchmaker',
            isVerified: true,
            isAvailable: true,
            rating: 5.0,
          },
        },
      },
      include: {
        technician: true,
      },
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    return NextResponse.json({ technician: user.technician, user: safeUser }, { status: 201 });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: err.errors[0]?.message ?? 'Invalid payload' }, { status: 422 });
    }
    console.error('[Technicians POST Error]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to create technician' }, { status: 500 });
  }
}
