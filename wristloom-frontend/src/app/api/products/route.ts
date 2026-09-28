// ============================================================
// Wristloom — Products API Route
// GET: Public list with filtering and search
// POST: Admin only product creation
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth, requireRole } from '@/lib/auth';
import { z } from 'zod';

const createProductSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  brand: z.string().min(2, 'Brand is required'),
  slug: z.string().optional(),
  referenceNumber: z.string().optional(),
  price: z.number().positive('Price must be greater than 0'),
  currency: z.string().default('INR'),
  images: z.array(z.string()).default([]),
  description: z.string().min(10, 'Description is required'),
  craftsmanshipNarrative: z.string().optional(),
  movementType: z.string().optional(),
  movementCaliber: z.string().optional(),
  powerReserve: z.string().optional(),
  caseMaterial: z.string().optional(),
  caseSize: z.string().optional(),
  caseThickness: z.string().optional(),
  dialColor: z.string().optional(),
  crystal: z.string().optional(),
  waterResistance: z.string().optional(),
  condition: z.string().default('New'),
  year: z.number().int().optional(),
  inStock: z.boolean().default(true),
  stockCount: z.number().int().default(1),
  collection: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q');
    const brand = searchParams.get('brand');
    const condition = searchParams.get('condition');
    const sort = searchParams.get('sort');

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (brand && brand !== 'all') {
      where.brand = { equals: brand, mode: 'insensitive' };
    }

    if (condition && condition !== 'all') {
      where.condition = { equals: condition, mode: 'insensitive' };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    if (sort === 'price-desc') orderBy = { price: 'desc' };
    if (sort === 'name-asc') orderBy = { name: 'asc' };

    const products = await db.product.findMany({
      where,
      orderBy,
    });

    return NextResponse.json({ products, total: products.length });
  } catch (error: any) {
    console.error('[Products GET Error]', error);
    return NextResponse.json({ error: error.message ?? 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createProductSchema.parse(body);

    const generatedSlug = parsed.slug || `${parsed.brand}-${parsed.name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existing = await db.product.findUnique({ where: { slug: generatedSlug } });
    const finalSlug = existing ? `${generatedSlug}-${Date.now().toString().slice(-4)}` : generatedSlug;

    const product = await db.product.create({
      data: {
        ...parsed,
        slug: finalSlug,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message ?? 'Invalid payload' }, { status: 422 });
    }
    console.error('[Products POST Error]', error);
    return NextResponse.json({ error: error.message ?? 'Failed to create product' }, { status: 500 });
  }
}
