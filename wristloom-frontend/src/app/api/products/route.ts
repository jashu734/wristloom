// ============================================================
// Wristloom — Products API Route
// GET: Public list with filtering, searching, and sorting
// POST: Admin ONLY product creation (Role verification enforced)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { isUserAdmin } from '@/lib/roles';
import { WATCH_BRANDS } from '@/lib/constants';
import { z } from 'zod';

const createProductSchema = z.object({
  name: z.string().min(2, 'Model name or watch name is required'),
  modelName: z.string().optional(),
  brand: z.string().min(2, 'Brand is required'),
  slug: z.string().optional(),
  referenceNumber: z.string().min(1, 'Reference number is required'),
  price: z.number().positive('Price/Purchase value must be greater than 0').optional(),
  purchaseValue: z.number().positive('Purchase value must be greater than 0').optional(),
  currency: z.string().default('INR'),
  images: z.array(z.string()).default([]),
  imageUrl: z.string().optional(),
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
  stockCount: z.number().int().default(1).optional(),
  stock: z.number().int().default(1).optional(),
  collection: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const isAdmin = isUserAdmin(session?.user);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q');
    const brand = searchParams.get('brand');
    const movementType = searchParams.get('movementType') || searchParams.get('movement');
    const caseSize = searchParams.get('caseSize');
    const condition = searchParams.get('condition');
    const sort = searchParams.get('sort');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const where: any = {};

    // Customer shop only sees active catalog items
    if (!isAdmin || !includeInactive) {
      where.isActive = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { modelName: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (brand && brand !== 'all') {
      where.brand = { equals: brand, mode: 'insensitive' };
    }

    if (movementType && movementType !== 'all') {
      where.movementType = { equals: movementType, mode: 'insensitive' };
    }

    if (caseSize && caseSize !== 'all') {
      where.caseSize = { contains: caseSize, mode: 'insensitive' };
    }

    if (condition && condition !== 'all') {
      where.condition = { equals: condition, mode: 'insensitive' };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-asc' || sort === 'purchaseValue-asc') orderBy = { price: 'asc' };
    if (sort === 'price-desc' || sort === 'purchaseValue-desc') orderBy = { price: 'desc' };
    if (sort === 'name-asc') orderBy = { name: 'asc' };

    const rawProducts = await db.product.findMany({
      where,
      orderBy,
    });

    // Format products ensuring purchaseValue, modelName, and imageUrl are consistent
    const products = rawProducts.map((p) => {
      const purchaseVal = p.purchaseValue ?? p.price;
      const primaryImage = p.imageUrl || (p.images && p.images.length > 0 ? p.images[0] : '/watches/placeholder-watch.svg');
      const allImages = p.images && p.images.length > 0 ? p.images : [primaryImage];
      const stockQty = p.stock ?? p.stockCount;

      return {
        ...p,
        modelName: p.modelName || p.name,
        purchaseValue: purchaseVal,
        price: purchaseVal,
        imageUrl: primaryImage,
        images: allImages,
        stock: stockQty,
        stockCount: stockQty,
      };
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
    
    // Strict authentication & authorization: ADMIN ONLY
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    if (!isUserAdmin(session.user)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createProductSchema.parse(body);

    // Validate brand against the 12 allowed brands
    const allowed = (WATCH_BRANDS as readonly string[]).map((b) => b.toLowerCase());
    const isBrandAllowed = allowed.includes(parsed.brand.trim().toLowerCase());

    if (!isBrandAllowed) {
      return NextResponse.json(
        { error: `Brand "${parsed.brand}" is not authorized. Must be one of: ${WATCH_BRANDS.join(', ')}` },
        { status: 422 }
      );
    }

    // Resolve matched brand casing
    const matchedBrand = WATCH_BRANDS.find((b) => b.toLowerCase() === parsed.brand.trim().toLowerCase()) || parsed.brand;

    const finalPrice = parsed.purchaseValue ?? parsed.price ?? 0;
    if (finalPrice <= 0) {
      return NextResponse.json({ error: 'Purchase value must be greater than 0' }, { status: 422 });
    }

    const finalModelName = parsed.modelName || parsed.name;
    const finalStock = parsed.stock ?? parsed.stockCount ?? 1;

    // Resolve images
    let imagesArr = parsed.images;
    if (parsed.imageUrl && !imagesArr.includes(parsed.imageUrl)) {
      imagesArr = [parsed.imageUrl, ...imagesArr];
    }
    if (imagesArr.length === 0) {
      imagesArr = ['/watches/placeholder-watch.svg'];
    }
    const finalImageUrl = parsed.imageUrl || imagesArr[0];

    const generatedSlug =
      parsed.slug ||
      `${matchedBrand}-${finalModelName}-${parsed.referenceNumber}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const existing = await db.product.findUnique({ where: { slug: generatedSlug } });
    const finalSlug = existing ? `${generatedSlug}-${Date.now().toString().slice(-4)}` : generatedSlug;

    const product = await db.product.create({
      data: {
        name: finalModelName,
        modelName: finalModelName,
        brand: matchedBrand,
        slug: finalSlug,
        referenceNumber: String(parsed.referenceNumber).trim(),
        price: finalPrice,
        purchaseValue: finalPrice,
        currency: parsed.currency || 'INR',
        images: imagesArr,
        imageUrl: finalImageUrl,
        description: parsed.description,
        craftsmanshipNarrative: parsed.craftsmanshipNarrative,
        movementType: parsed.movementType,
        movementCaliber: parsed.movementCaliber,
        powerReserve: parsed.powerReserve,
        caseMaterial: parsed.caseMaterial,
        caseSize: parsed.caseSize,
        caseThickness: parsed.caseThickness,
        dialColor: parsed.dialColor,
        crystal: parsed.crystal,
        waterResistance: parsed.waterResistance,
        condition: parsed.condition,
        year: parsed.year,
        inStock: parsed.inStock,
        stockCount: finalStock,
        stock: finalStock,
        collection: parsed.collection,
        tags: parsed.tags,
        isActive: parsed.isActive !== undefined ? parsed.isActive : true,
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
