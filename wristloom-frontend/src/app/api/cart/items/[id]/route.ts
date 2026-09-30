// ============================================================
// Wristloom — Customer Single Cart Item API Route
// PATCH: Update quantity of own cart item (validates ownership & stock)
// DELETE: Remove own cart item (validates ownership)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const updateItemSchema = z.object({
  quantity: z.number().int(),
});

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const parsed = updateItemSchema.parse(body);

    // 1. Fetch item with cart and product details
    const item = await db.cartItem.findUnique({
      where: { id },
      include: {
        cart: true,
        product: true,
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    // 2. Strict Customer Ownership Check: Customer A cannot touch Customer B's items
    if (item.cart.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this cart item' }, { status: 403 });
    }

    // 3. If quantity <= 0, remove item
    if (parsed.quantity <= 0) {
      await db.cartItem.delete({
        where: { id: item.id },
      });
      return NextResponse.json({ success: true, removed: true, message: 'Item removed from cart' });
    }

    // 4. Validate available stock
    const availableStock = item.product.stock ?? item.product.stockCount ?? 0;
    if (parsed.quantity > availableStock) {
      return NextResponse.json(
        { error: `Cannot set quantity to ${parsed.quantity}. Only ${availableStock} in stock.` },
        { status: 400 }
      );
    }

    const updated = await db.cartItem.update({
      where: { id: item.id },
      data: {
        quantity: parsed.quantity,
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json({
      success: true,
      item: {
        id: updated.id,
        productId: updated.productId,
        quantity: updated.quantity,
        product: {
          id: updated.product.id,
          name: updated.product.modelName || updated.product.name,
          brand: updated.product.brand,
          referenceNumber: updated.product.referenceNumber,
          purchaseValue: updated.product.purchaseValue ?? updated.product.price,
          imageUrl: updated.product.imageUrl || updated.product.images?.[0] || '/watches/placeholder-watch.svg',
        },
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message ?? 'Invalid payload' }, { status: 422 });
    }
    console.error('[Cart Item PATCH Error]', error);
    return NextResponse.json({ error: error.message ?? 'Failed to update cart item' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const { id } = await context.params;

    const item = await db.cartItem.findUnique({
      where: { id },
      include: {
        cart: true,
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    // Strict Customer Ownership Check
    if (item.cart.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this cart item' }, { status: 403 });
    }

    await db.cartItem.delete({
      where: { id: item.id },
    });

    return NextResponse.json({ success: true, message: 'Item removed from cart' });
  } catch (error: any) {
    console.error('[Cart Item DELETE Error]', error);
    return NextResponse.json({ error: error.message ?? 'Failed to remove cart item' }, { status: 500 });
  }
}
