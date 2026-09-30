// ============================================================
// Wristloom — Single Product API Route
// GET: Product details by ID or Slug
// PUT / PATCH: Admin product update (Role verified)
// DELETE: Admin product deactivation / removal (Role verified)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { isUserAdmin } from '@/lib/roles';
import { WATCH_BRANDS } from '@/lib/constants';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const p = await db.product.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
    });

    if (!p) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const purchaseVal = p.purchaseValue ?? p.price;
    const primaryImage = p.imageUrl || (p.images && p.images.length > 0 ? p.images[0] : '/watches/placeholder-watch.svg');
    const allImages = p.images && p.images.length > 0 ? p.images : [primaryImage];
    const stockQty = p.stock ?? p.stockCount;

    const formattedProduct = {
      ...p,
      modelName: p.modelName || p.name,
      purchaseValue: purchaseVal,
      price: purchaseVal,
      imageUrl: primaryImage,
      images: allImages,
      stock: stockQty,
      stockCount: stockQty,
    };

    return NextResponse.json({ product: formattedProduct });
  } catch (error: any) {
    console.error('[Product GET Error]', error);
    return NextResponse.json({ error: error.message ?? 'Failed to fetch product' }, { status: 500 });
  }
}

async function handleUpdateProduct(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    // Strict role check: ADMIN ONLY
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    if (!isUserAdmin(session.user)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await req.json();

    const existing = await db.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Validate brand if provided
    let matchedBrand = body.brand;
    if (body.brand) {
      const allowed = (WATCH_BRANDS as readonly string[]).map((b) => b.toLowerCase());
      if (!allowed.includes(body.brand.trim().toLowerCase())) {
        return NextResponse.json(
          { error: `Brand "${body.brand}" is not authorized. Must be one of: ${WATCH_BRANDS.join(', ')}` },
          { status: 422 }
        );
      }
      matchedBrand = WATCH_BRANDS.find((b) => b.toLowerCase() === body.brand.trim().toLowerCase()) || body.brand;
    }

    // Sync field names
    const updateData: any = {};

    if (body.name !== undefined || body.modelName !== undefined) {
      const nameVal = body.modelName || body.name;
      updateData.name = nameVal;
      updateData.modelName = nameVal;
    }

    if (matchedBrand) updateData.brand = matchedBrand;

    if (body.referenceNumber !== undefined) {
      updateData.referenceNumber = String(body.referenceNumber).trim();
    }

    if (body.purchaseValue !== undefined || body.price !== undefined) {
      const priceVal = Number(body.purchaseValue ?? body.price);
      if (priceVal <= 0) {
        return NextResponse.json({ error: 'Price/Purchase value must be positive' }, { status: 422 });
      }
      updateData.price = priceVal;
      updateData.purchaseValue = priceVal;
    }

    if (body.stock !== undefined || body.stockCount !== undefined) {
      const stockVal = Number(body.stock ?? body.stockCount);
      updateData.stock = stockVal;
      updateData.stockCount = stockVal;
    }

    if (body.inStock !== undefined) updateData.inStock = Boolean(body.inStock);
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    if (body.imageUrl !== undefined || body.images !== undefined) {
      let imagesArr = body.images;
      if (imagesArr && !Array.isArray(imagesArr)) {
        imagesArr = [imagesArr];
      }
      if (body.imageUrl) {
        imagesArr = imagesArr ? [body.imageUrl, ...imagesArr.filter((u: string) => u !== body.imageUrl)] : [body.imageUrl];
        updateData.imageUrl = body.imageUrl;
      } else if (imagesArr && imagesArr.length > 0) {
        updateData.imageUrl = imagesArr[0];
      }
      if (imagesArr) updateData.images = imagesArr;
    }

    if (body.description !== undefined) updateData.description = body.description;
    if (body.craftsmanshipNarrative !== undefined) updateData.craftsmanshipNarrative = body.craftsmanshipNarrative;
    if (body.movementType !== undefined) updateData.movementType = body.movementType;
    if (body.movementCaliber !== undefined) updateData.movementCaliber = body.movementCaliber;
    if (body.powerReserve !== undefined) updateData.powerReserve = body.powerReserve;
    if (body.caseMaterial !== undefined) updateData.caseMaterial = body.caseMaterial;
    if (body.caseSize !== undefined) updateData.caseSize = body.caseSize;
    if (body.caseThickness !== undefined) updateData.caseThickness = body.caseThickness;
    if (body.dialColor !== undefined) updateData.dialColor = body.dialColor;
    if (body.crystal !== undefined) updateData.crystal = body.crystal;
    if (body.waterResistance !== undefined) updateData.waterResistance = body.waterResistance;
    if (body.condition !== undefined) updateData.condition = body.condition;
    if (body.year !== undefined) updateData.year = body.year ? Number(body.year) : null;
    if (body.collection !== undefined) updateData.collection = body.collection;
    if (body.tags !== undefined) updateData.tags = body.tags;

    const updated = await db.product.update({
      where: { id: existing.id },
      data: updateData,
    });

    const purchaseVal = updated.purchaseValue ?? updated.price;
    const primaryImage = updated.imageUrl || (updated.images && updated.images.length > 0 ? updated.images[0] : '/watches/placeholder-watch.svg');

    return NextResponse.json({
      product: {
        ...updated,
        modelName: updated.modelName || updated.name,
        purchaseValue: purchaseVal,
        price: purchaseVal,
        imageUrl: primaryImage,
        stock: updated.stock ?? updated.stockCount,
      },
    });
  } catch (error: any) {
    console.error('[Product Update Error]', error);
    return NextResponse.json({ error: error.message ?? 'Failed to update product' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  return handleUpdateProduct(req, context);
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  return handleUpdateProduct(req, context);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    // Strict role check: ADMIN ONLY
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    if (!isUserAdmin(session.user)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = await context.params;

    const existing = await db.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if referenced in historical orders
    const orderItemsCount = await db.orderItem.count({
      where: { productId: existing.id },
    });

    // Check if in carts
    await db.cartItem.deleteMany({
      where: { productId: existing.id },
    }).catch(() => {});

    if (orderItemsCount > 0) {
      // Soft deletion: preserve historical order integrity
      await db.product.update({
        where: { id: existing.id },
        data: {
          isActive: false,
          inStock: false,
        },
      });
      return NextResponse.json({
        success: true,
        message: 'Product deactivated (preserved for historical orders)',
        softDeleted: true,
      });
    } else {
      // Hard delete if never ordered
      await db.product.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({
        success: true,
        message: 'Product removed from catalog',
      });
    }
  } catch (error: any) {
    console.error('[Product DELETE Error]', error);
    return NextResponse.json({ error: error.message ?? 'Failed to delete product' }, { status: 500 });
  }
}
