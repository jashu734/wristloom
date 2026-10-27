// ============================================================
// Wristloom — Admin Single Brand API Route
// GET: Fetch brand details (ADMIN ONLY)
// PUT: Update brand details with duplicate prevention (ADMIN ONLY)
// DELETE: Delete brand safely with product dependency guard (ADMIN ONLY)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { isUserAdmin } from '@/lib/roles';
import { z } from 'zod';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const updateBrandSchema = z.object({
  name: z.string().trim().min(2, 'Brand name must be at least 2 characters').optional(),
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
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
    if (!isUserAdmin(session.user)) {
      return NextResponse.json({ error: 'Forbidden: Administrator privileges required' }, { status: 403 });
    }

    const { id } = await context.params;

    const brand = await db.brand.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json({
      brand: {
        ...brand,
        productCount: brand._count.products,
      },
    });
  } catch (error: any) {
    console.error('[Admin Brand GET Error]', error);
    return NextResponse.json(
      { error: error.message ?? 'Failed to retrieve brand' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
    if (!isUserAdmin(session.user)) {
      return NextResponse.json({ error: 'Forbidden: Administrator privileges required' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const validated = updateBrandSchema.parse(body);

    const existing = await db.brand.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    // Duplicate name check if changing name
    if (validated.name && validated.name.trim().toLowerCase() !== existing.name.toLowerCase()) {
      const duplicate = await db.brand.findFirst({
        where: {
          name: {
            equals: validated.name.trim(),
            mode: 'insensitive',
          },
          id: { not: existing.id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: `Another brand with the name "${validated.name.trim()}" already exists.` },
          { status: 409 }
        );
      }
    }

    const updatedName = validated.name ? validated.name.trim() : existing.name;

    // Update in database (transactional if name changed to also sync products.brand)
    const updatedBrand = await db.$transaction(async (tx) => {
      const result = await tx.brand.update({
        where: { id: existing.id },
        data: {
          name: updatedName,
          logo: validated.logo !== undefined ? validated.logo : existing.logo,
          description: validated.description !== undefined ? validated.description : existing.description,
          websiteUrl: validated.websiteUrl !== undefined ? validated.websiteUrl : existing.websiteUrl,
          isActive: validated.isActive !== undefined ? validated.isActive : existing.isActive,
        },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });

      // If brand name changed, keep the product.brand text column in sync
      if (validated.name && validated.name.trim() !== existing.name) {
        await tx.product.updateMany({
          where: { brandId: existing.id },
          data: { brand: updatedName },
        });
      }

      return result;
    });

    return NextResponse.json({
      message: 'Brand updated successfully',
      brand: {
        ...updatedBrand,
        productCount: updatedBrand._count.products,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Validation error' },
        { status: 422 }
      );
    }
    console.error('[Admin Brand PUT Error]', error);
    return NextResponse.json(
      { error: error.message ?? 'Failed to update brand' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
    if (!isUserAdmin(session.user)) {
      return NextResponse.json({ error: 'Forbidden: Administrator privileges required' }, { status: 403 });
    }

    const { id } = await context.params;

    const brand = await db.brand.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    const productCount = brand._count.products;

    // Strict referential integrity check
    if (productCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete brand "${brand.name}". There are ${productCount} associated timepiece(s) in the catalog. To hide this brand from new product creation and discovery, please deactivate it instead.`,
          associatedProductCount: productCount,
          restricted: true,
        },
        { status: 409 }
      );
    }

    // Safe delete
    await db.brand.delete({
      where: { id: brand.id },
    });

    return NextResponse.json({
      message: `Brand "${brand.name}" deleted successfully`,
      deletedId: brand.id,
    });
  } catch (error: any) {
    console.error('[Admin Brand DELETE Error]', error);
    return NextResponse.json(
      { error: error.message ?? 'Failed to delete brand' },
      { status: 500 }
    );
  }
}
