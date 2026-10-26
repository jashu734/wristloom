// ============================================================
// Wristloom — Account Anonymization & Deletion Route
// Layer 10 & 16: Security, Privacy & Data Protection (15-Layer SaaS Playbook, p. 23, 34)
// Anonymizes customer PII while preserving legal transaction records.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const deleteRequestSchema = z.object({
  confirmPhrase: z.literal('DELETE MY ACCOUNT'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = deleteRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Confirmation phrase mismatch. You must confirm with "DELETE MY ACCOUNT".' },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const user = await db.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ error: 'User record not found' }, { status: 404 });
    }

    // Administrators cannot delete their own account via self-service
    if (user.role === 'ADMIN') {
      return NextResponse.json({ error: 'Administrator accounts cannot be deleted via self-service.' }, { status: 403 });
    }

    // 1. Delete user addresses, vault items, and active sessions
    await Promise.all([
      db.session.deleteMany({ where: { userId } }),
      db.account.deleteMany({ where: { userId } }),
      db.address.deleteMany({ where: { userId } }),
      db.watchVaultItem.deleteMany({ where: { ownerId: userId } }),
      db.notification.deleteMany({ where: { userId } }),
    ]);

    // 2. Anonymize user record to preserve foreign keys on historic orders and bookings
    const anonymizedEmail = `anonymized_${userId.slice(0, 8)}_${Date.now()}@deleted.wristloom.luxury`;
    await db.user.update({
      where: { id: userId },
      data: {
        name: 'Former Collector',
        email: anonymizedEmail,
        phone: null,
        passwordHash: null,
        profileImage: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Account data anonymized and deleted in accordance with data privacy regulations.',
    });
  } catch (error: any) {
    console.error('[User Delete Error]', error);
    return NextResponse.json({ error: error.message || 'Failed to process account deletion' }, { status: 500 });
  }
}
