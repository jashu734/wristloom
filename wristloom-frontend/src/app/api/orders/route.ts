// ============================================================
// Wristloom — Orders API Route
// Server-side price calculation, inventory checks, strong references
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { isUserAdmin } from '@/lib/roles';
import { generateOrderReference } from '@/lib/guest';
import { verifyAndReserveInventory } from '@/lib/inventory';

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product ID required'),
        quantity: z.number().int().min(1).max(10).default(1),
        strapOption: z
          .object({
            id: z.string(),
            material: z.string(),
            price_addon: z.number().default(0),
          })
          .optional(),
      })
    )
    .min(1, 'Order must contain at least one item'),
  shippingName: z.string().trim().min(2, 'Name is required').max(100),
  shippingEmail: z.string().trim().email('Valid email is required').max(255),
  shippingPhone: z.string().trim().min(6, 'Phone is required').max(32),
  shippingAddress: z.object({
    addressLine: z.string().min(3),
    city: z.string().min(2),
    postalCode: z.string().optional(),
    country: z.string().default('India'),
  }),
  paymentMethod: z.string().default('concierge'),
  notes: z.string().max(1000).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('q');

    const isAdmin = isUserAdmin(session.user);

    const where: any = {};
    if (!isAdmin) {
      where.userId = session.user.id;
    } else {
      if (status && status !== 'ALL') {
        where.status = status;
      }
      if (search) {
        where.OR = [
          { orderReference: { contains: search, mode: 'insensitive' } },
          { shippingName: { contains: search, mode: 'insensitive' } },
          { shippingEmail: { contains: search, mode: 'insensitive' } },
        ];
      }
    }

    const orders = await db.order.findMany({
      where,
      include: {
        orderItems: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders, total: orders.length });
  } catch (error: any) {
    console.error('[Orders GET Error]', error);
    return NextResponse.json({ error: error.message ?? 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const parsed = createOrderSchema.parse(body);

    // 1. Fetch real products from database to calculate server-side prices
    const productKeys = parsed.items.map((i: any) => i.productId);
    const dbProducts = await db.product.findMany({
      where: {
        OR: [
          { id: { in: productKeys } },
          { slug: { in: productKeys } },
          { referenceNumber: { in: productKeys } },
        ],
      },
    });

    const dbProductMap = new Map<string, any>();
    for (const p of dbProducts) {
      dbProductMap.set(p.id, p);
      if (p.slug) dbProductMap.set(p.slug, p);
      if (p.referenceNumber) dbProductMap.set(p.referenceNumber, p);
    }

    // 2. Inventory & Stock Validation
    const inventoryCheck = await verifyAndReserveInventory(
      parsed.items.map((item: any) => {
        const prod = dbProductMap.get(item.productId);
        return {
          productId: prod?.id || item.productId,
          name: prod?.name || item.productId,
          quantity: item.quantity,
        };
      })
    );

    if (!inventoryCheck.success) {
      return NextResponse.json({ error: inventoryCheck.error }, { status: 400 });
    }

    // 3. Compute Authoritative Total Server-Side
    let computedTotal = 0;
    const orderItemsToCreate = [];

    for (const item of parsed.items) {
      const dbProd = dbProductMap.get(item.productId);
      if (!dbProd) {
        return NextResponse.json(
          { error: `Timepiece "${item.productId}" was not found in our collection.` },
          { status: 404 }
        );
      }

      const strapAddon = item.strapOption?.price_addon ?? 0;
      const unitPrice = dbProd.price + strapAddon;
      const lineTotal = unitPrice * item.quantity;
      computedTotal += lineTotal;

      orderItemsToCreate.push({
        productId: dbProd.id,
        name: dbProd.name,
        brand: dbProd.brand,
        referenceNumber: dbProd.referenceNumber,
        price: unitPrice,
        quantity: item.quantity,
        imageUrl: dbProd.images?.[0] ?? null,
        strapOption: item.strapOption ? item.strapOption : undefined,
      });
    }

    const orderReference = generateOrderReference();

    const order = await db.order.create({
      data: {
        orderReference,
        userId: session?.user?.id ?? null,
        totalAmount: computedTotal,
        currency: 'INR',
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        paymentMethod: parsed.paymentMethod,
        shippingName: parsed.shippingName,
        shippingEmail: parsed.shippingEmail.toLowerCase().trim(),
        shippingPhone: parsed.shippingPhone,
        shippingAddress: parsed.shippingAddress,
        notes: parsed.notes,
        orderItems: {
          create: orderItemsToCreate,
        },
      },
      include: {
        orderItems: true,
      },
    });

    // Notify customer in-app if logged in
    if (session?.user?.id) {
      await db.notification.create({
        data: {
          userId: session.user.id,
          type: 'BOOKING_CONFIRMED',
          title: 'Order Confirmed',
          body: `Your acquisition order #${order.orderReference} for ₹${computedTotal.toLocaleString('en-IN')} has been placed.`,
        },
      }).catch((e: any) => console.warn('Order notification warning:', e));
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message ?? 'Invalid order payload' }, { status: 422 });
    }
    console.error('[Orders POST Error]', error);
    return NextResponse.json({ error: error.message ?? 'Failed to create order' }, { status: 500 });
  }
}
