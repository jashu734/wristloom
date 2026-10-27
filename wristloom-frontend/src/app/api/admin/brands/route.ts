// ============================================================
// Wristloom — Admin Brands API Route
// GET: Fetch all brands (active & inactive) with metrics (ADMIN ONLY)
// POST: Create a new brand with duplicate protection (ADMIN ONLY)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { isUserAdmin } from '@/lib/roles';
import { z } from 'zod';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const createBrandSchema = z.object({
  name: z.string().trim().min(2, 'Brand name must be at least 2 characters'),
  logo: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  websiteUrl: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^https?:\/\/.+/i.test(val),
      'Website URL must start with http:// or https://'
    ),
  isActive: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
    if (!isUserAdmin(session.user)) {
      return NextResponse.json({ error: 'Forbidden: Administrator privileges required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q');
    const status = searchParams.get('status'); // 'all' | 'active' | 'inactive'

    const where: any = {};

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const brands = await db.brand.findMany({
      where,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const formatted = brands.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      logo: b.logo,
      description: b.description,
      websiteUrl: b.websiteUrl,
      isActive: b.isActive,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      productCount: b._count.products,
    }));

    return NextResponse.json({ brands: formatted, total: formatted.length });
  } catch (error: any) {
    console.error('[Admin Brands GET Error]', error);
    return NextResponse.json(
      { error: error.message ?? 'Failed to retrieve brands' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
    if (!isUserAdmin(session.user)) {
      return NextResponse.json({ error: 'Forbidden: Administrator privileges required' }, { status: 403 });
    }

    const body = await req.json();
    const validated = createBrandSchema.parse(body);

    const cleanName = validated.name.trim();

    // 1. Duplicate check (Case-insensitive)
    const existing = await db.brand.findFirst({
      where: {
        name: {
          equals: cleanName,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `A brand with the name "${cleanName}" already exists (ID: ${existing.id}).` },
        { status: 409 }
      );
    }

    // 2. Generate slug & ensure uniqueness
    let baseSlug = slugify(cleanName);
    if (!baseSlug) baseSlug = 'brand';

    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await db.brand.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 3. Create Brand
    const createdBrand = await db.brand.create({
      data: {
        name: cleanName,
        slug: uniqueSlug,
        logo: validated.logo || null,
        description: validated.description || null,
        websiteUrl: validated.websiteUrl || null,
        isActive: validated.isActive !== undefined ? validated.isActive : true,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Brand registered successfully',
        brand: {
          ...createdBrand,
          productCount: createdBrand._count.products,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Validation error' },
        { status: 422 }
      );
    }
    console.error('[Admin Brand POST Error]', error);
    return NextResponse.json(
      { error: error.message ?? 'Failed to create brand' },
      { status: 500 }
    );
  }
}
