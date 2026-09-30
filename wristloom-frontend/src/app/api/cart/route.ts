// ============================================================
// Wristloom — Customer Cart API Route
// GET: Returns authenticated customer's own cart and items
// DELETE: Clears authenticated customer's own cart
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({
        cart: {
          id: 'guest',
          userId: null,
          items: [],
          totalItems: 0,
          subtotal: 0,
          total: 0,
          isGuest: true,
        },
      });
    }

    const userId = session.user.id;

    // Find or create customer's private cart
    let cart = await db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cart) {
      cart = await db.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    // Format items with normalized fields and check stock availability
    const items = cart.items.map((item) => {
      const p = item.product;
      const purchaseValue = p.purchaseValue ?? p.price;
      const primaryImage = p.imageUrl || (p.images && p.images.length > 0 ? p.images[0] : '/watches/placeholder-watch.svg');
      const availableStock = p.stock ?? p.stockCount;
      const strapAddon = (item.strapOption as any)?.price_addon || 0;
      const unitPrice = purchaseValue + strapAddon;
      const itemTotal = unitPrice * item.quantity;

      return {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        strapOption: item.strapOption,
        unitPrice,
        totalPrice: itemTotal,
        product: {
          id: p.id,
          slug: p.slug,
          name: p.modelName || p.name,
          modelName: p.modelName || p.name,
          brand: p.brand,
          referenceNumber: p.referenceNumber,
          reference_number: p.referenceNumber,
          caseSize: p.caseSize,
          movementType: p.movementType,
          purchaseValue,
          price: purchaseValue,
          imageUrl: primaryImage,
          images: p.images && p.images.length > 0 ? p.images : [primaryImage],
          stock: availableStock,
          stockCount: availableStock,
          inStock: p.inStock && availableStock > 0 && p.isActive,
          isActive: p.isActive,
          description: p.description,
        },
      };
    });

    // Subtotal and Total calculations
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const total = subtotal; // Free white-glove shipping & insurance included

    return NextResponse.json({
      cart: {
        id: cart.id,
        userId: cart.userId,
        items,
        totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
        subtotal,
        total,
      },
    });
  } catch (error: any) {
    console.error('[Cart GET Error]', error);
    return NextResponse.json({ error: error.message ?? 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const userId = session.user.id;

    const cart = await db.cart.findUnique({
      where: { userId },
    });

    if (cart) {
      await db.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return NextResponse.json({ success: true, message: 'Cart cleared' });
  } catch (error: any) {
    console.error('[Cart DELETE Error]', error);
    return NextResponse.json({ error: error.message ?? 'Failed to clear cart' }, { status: 500 });
  }
}
