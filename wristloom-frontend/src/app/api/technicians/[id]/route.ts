// ============================================================
// Wristloom — Single Technician API Route (Next.js)
// Handles GET and PATCH for technician availability and details
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

import { auth } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    const { id } = await context.params;

    const tech = await db.technician.findUnique({
      where: { id },
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
            email: session?.user?.role === 'ADMIN',
            phone: session?.user?.role === 'ADMIN',
          },
        },
      },
    });

    if (!tech) {
      return NextResponse.json({ error: 'Technician not found' }, { status: 404 });
    }

    // Allow technician themselves to see their own contact details
    if (session?.user?.id === tech.userId) {
      const fullUser = await db.user.findUnique({
        where: { id: tech.userId },
        select: { email: true, phone: true },
      });
      if (fullUser) {
        (tech.user as any).email = fullUser.email;
        (tech.user as any).phone = fullUser.phone;
      }
    }

    return NextResponse.json(tech);
  } catch (err: any) {
    console.error('[Technician GET Error]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to load technician' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const tech = await db.technician.findUnique({ where: { id } });
    if (!tech) {
      return NextResponse.json({ error: 'Technician not found' }, { status: 404 });
    }

    const isAdmin = session.user.role === 'ADMIN';
    const isSelf = tech.userId === session.user.id;

    if (!isAdmin && !isSelf) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, phone, specializations, yearsExperience, bio, serviceRadiusKm, isAvailable, isVerified } = body;

    // 1. Update user fields (name, phone) if provided and authorized
    if (name !== undefined || phone !== undefined) {
      const userUpdate: Record<string, any> = {};
      if (typeof name === 'string' && name.trim()) userUpdate.name = name.trim();
      if (typeof phone === 'string') userUpdate.phone = phone.trim();

      if (Object.keys(userUpdate).length > 0) {
        await db.user.update({
          where: { id: tech.userId },
          data: userUpdate,
        });
      }
    }

    // 2. Update technician profile fields
    const data: Record<string, any> = {};
    if (typeof isAvailable === 'boolean') data.isAvailable = isAvailable;
    if (typeof isVerified === 'boolean') {
      if (!isAdmin) {
        return NextResponse.json({ error: 'Only admins can modify verification status' }, { status: 403 });
      }
      data.isVerified = isVerified;
    }

    if (specializations !== undefined) {
      if (Array.isArray(specializations)) {
        data.specializations = specializations.map((s) => String(s).trim()).filter(Boolean);
      } else if (typeof specializations === 'string') {
        data.specializations = specializations.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    if (yearsExperience !== undefined) {
      data.yearsExperience = Number(yearsExperience) || 0;
    }

    if (bio !== undefined && typeof bio === 'string') {
      data.bio = bio.trim();
    }

    if (serviceRadiusKm !== undefined) {
      data.serviceRadiusKm = Number(serviceRadiusKm) || 25;
    }

    const updated = await db.technician.update({
      where: { id },
      data,
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

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('[Technician PATCH Error]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to update technician' }, { status: 500 });
  }
}
