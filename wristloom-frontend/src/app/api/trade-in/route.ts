// ============================================================
// Wristloom — Trade-In & Watch Valuation API Route
// Calculates algorithmic secondary market estimates & saves trade-in requests
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

// Benchmark market baseline estimates (in INR)
const BRAND_BASELINES: Record<string, { baseMin: number; baseMax: number; liquidity: string }> = {
  titan: { baseMin: 8000, baseMax: 25000, liquidity: 'High' },
  fastrack: { baseMin: 2500, baseMax: 6000, liquidity: 'High' },
  sonata: { baseMin: 1200, baseMax: 3500, liquidity: 'High' },
  timex: { baseMin: 6000, baseMax: 18000, liquidity: 'Moderate' },
  casio: { baseMin: 5000, baseMax: 22000, liquidity: 'High' },
  fossil: { baseMin: 7000, baseMax: 18000, liquidity: 'Moderate' },
  seiko: { baseMin: 25000, baseMax: 95000, liquidity: 'High' },
  citizen: { baseMin: 18000, baseMax: 65000, liquidity: 'Moderate' },
  tissot: { baseMin: 35000, baseMax: 120000, liquidity: 'Moderate' },
  'tag heuer': { baseMin: 95000, baseMax: 320000, liquidity: 'High' },
  rado: { baseMin: 75000, baseMax: 240000, liquidity: 'Moderate' },
  omega: { baseMin: 280000, baseMax: 750000, liquidity: 'High' },
};

const CONDITION_MULTIPLIERS: Record<string, number> = {
  Mint: 1.0,
  Excellent: 0.92,
  Good: 0.82,
  Fair: 0.70,
  Poor: 0.52,
};

const SCOPE_MULTIPLIERS: Record<string, number> = {
  'Full Set (Box & Papers)': 1.15,
  'Watch & Papers': 1.08,
  'Watch & Box': 1.04,
  'Watch Only': 0.95,
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();

    const watch_brand = body.watch_brand || body.watchBrand;
    const watch_model = body.watch_model || body.watchModel;
    const reference_number = body.reference_number || body.referenceNumber || '';
    const condition = body.condition || 'Excellent';
    const box_and_papers =
      body.box_and_papers ||
      body.boxAndPapers ||
      (body.originalBoxAndPapers ? 'Full Set (Box & Papers)' : 'Watch Only');
    const desired_credit_use = body.desired_credit_use || body.desiredCreditUse || 'Purchase a new timepiece';
    const contact_name = body.contact_name || body.contactName || body.ownerName || session?.user?.name || '';
    const contact_email = body.contact_email || body.contactEmail || body.ownerEmail || session?.user?.email || '';
    const contact_phone = body.contact_phone || body.contactPhone || body.ownerPhone || '';

    if (!watch_brand || !watch_model || !contact_name || !contact_email) {
      return NextResponse.json({ error: 'Missing required watch or contact details' }, { status: 400 });
    }

    // 1. Calculate valuation
    const brandKey = watch_brand.toLowerCase().trim();
    const benchmark = BRAND_BASELINES[brandKey] || { baseMin: 300000, baseMax: 650000, liquidity: 'Moderate' };
    const condMult = CONDITION_MULTIPLIERS[condition] || 0.85;
    const scopeMult = SCOPE_MULTIPLIERS[box_and_papers] || 1.0;

    const estimatedMin = Math.round(benchmark.baseMin * condMult * scopeMult);
    const estimatedMax = Math.round(benchmark.baseMax * condMult * scopeMult);
    const averageValuation = Math.round((estimatedMin + estimatedMax) / 2);
    // 5% bonus credit for trading in towards an atelier piece
    const platformCreditOffer = Math.round(averageValuation * 1.05);

    const ref = `TRD-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    // 2. Persist in database
    const tradeIn = await db.tradeInRequest.create({
      data: {
        tradeInReference: ref,
        customerId: session?.user?.id || undefined,
        watchBrand: watch_brand,
        watchModel: watch_model,
        referenceNumber: reference_number || null,
        condition: `${condition} (${box_and_papers})`,
        contactName: contact_name,
        contactEmail: contact_email,
        contactPhone: contact_phone || '',
        desiredCreditUse: desired_credit_use || 'Purchase a watch',
        status: 'PENDING',
        valuationCredit: platformCreditOffer,
        notes: `Algorithmic Estimate: ₹${estimatedMin.toLocaleString('en-IN')} - ₹${estimatedMax.toLocaleString('en-IN')} (Credit Offer: ₹${platformCreditOffer.toLocaleString('en-IN')})`,
        photoUrls: [],
      },
    });

    // 3. Customer Notification if user logged in
    if (session?.user?.id) {
      await db.notification.create({
        data: {
          userId: session.user.id,
          type: 'CREDIT_EARNED',
          title: 'Trade-In Valuation Offer Ready',
          body: `Your ${watch_brand} ${watch_model} has an estimated trade-in credit valuation of ₹${platformCreditOffer.toLocaleString('en-IN')} (#${ref}).`,
        },
      }).catch((e) => console.warn('Notification warning:', e));
    }

    return NextResponse.json({
      success: true,
      tradeIn,
      valuation: {
        estimatedMin,
        estimatedMax,
        platformCreditOffer,
        liquidity: benchmark.liquidity,
        tradeInReference: ref,
      },
    });
  } catch (err: any) {
    console.error('Error submitting trade-in:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
