// ============================================================
// Wristloom — Customer Cart Items API Route
// POST: Adds an existing admin-created Product to the authenticated customer's cart
// Enforces:
// 1. Authenticated customer ownership
// 2. References existing Product (never creates a new Product)
// 3. Backend stock validation
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const addItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1).default(1),
  strapOption: z.any().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    const body = await req.json();
    const parsed = addItemSchema.parse(body);

    // 1. Verify that the product exists and is active
    const product = await db.product.findUnique({
      where: { id: parsed.productId },
    });

    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'Watch product not found or is currently inactive' }, { status: 404 });
    }

    // 2. Backend Stock Validation
    const availableStock = product.stock ?? product.stockCount ?? 0;
    if (availableStock <= 0 || !product.inStock) {
      return NextResponse.json({ error: `"${product.name}" is currently out of stock.` }, { status: 400 });
    }

    // If guest, return stock-validated confirmation for local Zustand store
    if (!session?.user?.id) {
      return NextResponse.json({
        success: true,
        message: 'Product added to guest cart',
        guest: true,
        item: {
          id: `guest-${parsed.productId}`,
          productId: product.id,
          quantity: parsed.quantity,
          strapOption: parsed.strapOption,
          product: {
            id: product.id,
            name: product.modelName || product.name,
            brand: product.brand,
            referenceNumber: product.referenceNumber,
            purchaseValue: product.purchaseValue ?? product.price,
            imageUrl: product.imageUrl || product.images?.[0] || '/watches/placeholder-watch.svg',
          },
        },
      });
    }

    const userId = session.user.id;

    // 3. Find or create the customer's private cart
    let cart = await db.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await db.cart.create({
        data: { userId },
      });
    }

    // 4. Check if item already exists in customer's cart
    const existingItem = await db.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: product.id,
      },
    });

    let resultItem;
    if (existingItem) {
      const newQuantity = existingItem.quantity + parsed.quantity;
      if (newQuantity > availableStock) {
        return NextResponse.json(
          { error: `Cannot add ${parsed.quantity} more. Only ${availableStock} in stock (you have ${existingItem.quantity} in cart).` },
          { status: 400 }
        );
      }

      resultItem = await db.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          strapOption: parsed.strapOption !== undefined ? parsed.strapOption : existingItem.strapOption,
        },
        include: { product: true },
      });
    } else {
      if (parsed.quantity > availableStock) {
        return NextResponse.json(
          { error: `Cannot add ${parsed.quantity}. Only ${availableStock} in stock.` },
          { status: 400 }
        );
      }

      // References existing admin-created Product (DO NOT create new Product)
      resultItem = await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity: parsed.quantity,
          strapOption: parsed.strapOption,
        },
        include: { product: true },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Product added to cart',
        item: {
          id: resultItem.id,
          productId: resultItem.productId,
          quantity: resultItem.quantity,
          strapOption: resultItem.strapOption,
          product: {
            id: product.id,
            name: product.modelName || product.name,
            brand: product.brand,
            referenceNumber: product.referenceNumber,
            purchaseValue: product.purchaseValue ?? product.price,
            imageUrl: product.imageUrl || product.images?.[0] || '/watches/placeholder-watch.svg',
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message ?? 'Invalid request payload' }, { status: 422 });
    }
    console.error('[Cart Items POST Error]', error);
    return NextResponse.json({ error: error.message ?? 'Failed to add item to cart' }, { status: 500 });
  }
}
