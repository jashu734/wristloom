import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name too long').optional(),
  phone: z.string().trim().max(32, 'Phone number too long').optional().nullable(),
  profileImage: z
    .string()
    .max(2048, 'Profile image URL must be under 2048 characters')
    .refine((val: string) => !val.startsWith('data:'), 'Profile images must be uploaded image URLs, not inline data URLs')
    .optional()
    .nullable(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// GET /api/user/profile — fetch authenticated user profile
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profileImage: true,
        createdAt: true,
        creditWallet: { select: { balance: true } },
        addresses: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err: unknown) {
    console.error('Error fetching user profile:', err);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PATCH /api/user/profile — update profile fields
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = profileSchema.parse(body);

    const updatePayload: { name?: string; phone?: string | null; profileImage?: string | null } = {};
    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.phone !== undefined) updatePayload.phone = data.phone?.trim() || null;
    if (data.profileImage !== undefined) updatePayload.profileImage = data.profileImage || null;

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: updatePayload,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profileImage: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message ?? 'Invalid input' }, { status: 400 });
    }
    console.error('Error updating user profile:', err);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

// POST /api/user/profile — change password
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = passwordSchema.parse(body);

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'This account was created with OAuth. Password change is not applicable.' },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({ success: true, message: 'Password changed successfully' });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message ?? 'Invalid input' }, { status: 400 });
    }
    console.error('Error changing password:', err);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
