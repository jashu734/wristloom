// ============================================================
// Wristloom — Data Export API Route
// Layer 10 & 16: Security, Privacy & Data Portability (15-Layer SaaS Playbook, p. 23, 34)
// Allows collectors to download complete personal data dossier.
// ============================================================

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required to export dossier' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user profile and all associated data
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        addresses: true,
        watchVaultItems: {
          include: { serviceHistory: true },
        },
        bookingsAsCustomer: {
          include: { address: true, serviceHistory: true },
        },
        orders: {
          include: { orderItems: true },
        },
        reviewsGiven: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User record not found' }, { status: 404 });
    }

    const exportPayload = {
      exportMetadata: {
        platform: 'Wristloom Haute Horlogerie Atelier',
        generatedAt: new Date().toISOString(),
        userReference: user.id,
        complianceNotice: 'Data exported pursuant to customer data portability rights.',
      },
      profile: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        memberSince: user.createdAt,
      },
      savedAddresses: user.addresses,
      digitalWatchVault: user.watchVaultItems,
      serviceBookings: user.bookingsAsCustomer,
      acquisitionOrders: user.orders,
      reviews: user.reviewsGiven,
    };

    return new NextResponse(JSON.stringify(exportPayload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="wristloom-dossier-${user.id}.json"`,
      },
    });
  } catch (error: any) {
    console.error('[User Data Export Error]', error);
    return NextResponse.json({ error: error.message || 'Failed to export customer dossier' }, { status: 500 });
  }
}
