// ============================================================
// Wristloom — Inventory & Stock Management Helper
// Atomic reservation and verification of timepiece catalog stock
// ============================================================

import { db } from '@/lib/db';

export interface ItemForInventoryCheck {
  productId?: string;
  name: string;
  quantity: number;
}

export async function verifyAndReserveInventory(
  items: ItemForInventoryCheck[]
): Promise<{ success: boolean; error?: string }> {
  for (const item of items) {
    if (!item.productId) continue;

    const product = await db.product.findUnique({
      where: { id: item.productId },
      select: { id: true, name: true, inStock: true, stockCount: true },
    });

    if (!product) {
      return { success: false, error: `Timepiece "${item.name}" is no longer available in the registry.` };
    }

    if (!product.inStock || product.stockCount < item.quantity) {
      return {
        success: false,
        error: `Insufficient stock for "${product.name}". Only ${product.stockCount} remaining.`,
      };
    }
  }

  return { success: true };
}

export async function decrementInventory(
  items: Array<{ productId?: string | null; quantity: number }>
): Promise<void> {
  for (const item of items) {
    if (!item.productId) continue;

    try {
      const product = await db.product.findUnique({
        where: { id: item.productId },
        select: { stockCount: true },
      });

      if (!product) continue;

      const newStock = Math.max(0, product.stockCount - item.quantity);
      await db.product.update({
        where: { id: item.productId },
        data: {
          stockCount: newStock,
          inStock: newStock > 0,
        },
      });
    } catch (err) {
      console.error(`[Inventory Decrement Error for ${item.productId}]`, err);
    }
  }
}
