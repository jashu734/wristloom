// ============================================================
// Wristloom — Orders API Route
// GET: Customer orders (or all orders for Admin)
// POST: Create new order
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().optional(),
      name: z.string(),
      brand: z.string(),
      referenceNumber: z.string().optional(),
      price: z.number(),
      quantity: z.number().int().positive().default(1),
      imageUrl: z.string().optional(),
      strapOption: z.any().optional(),
    })
  ).min(1, 'Order must contain at least one item'),
  totalAmount: z.number().positive(),
  shippingName: z.string().min(2, 'Name is required'),
  shippingEmail: z.string().email('Valid email is required'),
  shippingPhone: z.string().min(6, 'Phone is required'),
  shippingAddress: z.object({
    addressLine: z.string(),
    city: z.string(),
    postalCode: z.string().optional(),
    country: z.string().default('India'),
  }),
  paymentMethod: z.string().default('concierge'),
  notes: z.string().optional(),
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

    const isAdmin = session.user.role === 'ADMIN';

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

    const orderReference = `WL-ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const order = await db.order.create({
      data: {
        orderReference,
        userId: session?.user?.id ?? null,
        totalAmount: parsed.totalAmount,
        currency: 'INR',
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        paymentMethod: parsed.paymentMethod,
        shippingName: parsed.shippingName,
        shippingEmail: parsed.shippingEmail,
        shippingPhone: parsed.shippingPhone,
        shippingAddress: parsed.shippingAddress,
        notes: parsed.notes,
        orderItems: {
          create: parsed.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            brand: item.brand,
            referenceNumber: item.referenceNumber,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl,
            strapOption: item.strapOption ? item.strapOption : undefined,
          })),
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
          body: `Your acquisition order #${order.orderReference} has been received. Our concierge is preparing dispatch.`,
        },
      }).catch((e) => console.warn('Order notification warning:', e));
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
