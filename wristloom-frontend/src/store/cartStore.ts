// ============================================================
// Wristloom — Cart Zustand Store
// Client-side cart with strap variant tracking, quantity capping,
// and automatic persistence to /api/cart backend for authenticated customers
// ============================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // Product ID
  cartItemId?: string; // DB CartItem ID if synced
  slug: string;
  name: string;
  brand: string;
  reference_number: string;
  referenceNumber?: string;
  price: number;
  purchaseValue?: number;
  image: string;
  caseSize?: string;
  movementType?: string;
  strapOption?: { id: string; material: string; price_addon: number };
  quantity: number;
  stock?: number;
}

export interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => Promise<void>;
  removeItem: (id: string, strapOptionId?: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number, strapOptionId?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  totalItems: () => number;
  subtotal: () => number;
}

function matchesVariant(
  item: CartItem,
  id: string,
  strapOptionId?: string
): boolean {
  if (item.id !== id && item.cartItemId !== id) return false;
  if (strapOptionId !== undefined) {
    return (item.strapOption?.id || 'standard') === (strapOptionId || 'standard');
  }
  return true;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      syncWithServer: async () => {
        try {
          const res = await fetch('/api/cart');
          if (res.ok) {
            const data = await res.json();
            if (data?.cart?.items) {
              const serverItems: CartItem[] = data.cart.items.map((i: any) => ({
                id: i.product.id,
                cartItemId: i.id,
                slug: i.product.slug,
                name: i.product.modelName || i.product.name,
                brand: i.product.brand,
                reference_number: i.product.referenceNumber || '',
                referenceNumber: i.product.referenceNumber || '',
                price: i.product.purchaseValue ?? i.product.price,
                purchaseValue: i.product.purchaseValue ?? i.product.price,
                image: i.product.imageUrl || i.product.images?.[0] || '/watches/placeholder-watch.svg',
                caseSize: i.product.caseSize,
                movementType: i.product.movementType,
                strapOption: i.strapOption,
                quantity: i.quantity,
                stock: i.product.stock,
              }));
              set({ items: serverItems });
            }
          }
        } catch (e) {
          // Keep local items if unauthenticated / offline
        }
      },

      addItem: async (item) => {
        const itemStrapId = item.strapOption?.id || 'standard';
        const addQty = item.quantity || 1;

        // 1. Optimistic Local State Update
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => (i.id === item.id || i.cartItemId === item.id) && (i.strapOption?.id || 'standard') === itemStrapId
          );

          if (existingIndex > -1) {
            const currentQty = state.items[existingIndex].quantity;
            const maxCap = item.stock ? Math.min(10, item.stock) : 10;
            const newQty = Math.min(maxCap, currentQty + addQty);
            const updated = [...state.items];
            updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
            return { items: updated };
          }

          return { items: [...state.items, { ...item, quantity: addQty }] };
        });

        // 2. Persist to Backend API
        try {
          const res = await fetch('/api/cart/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: item.id,
              quantity: addQty,
              strapOption: item.strapOption,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.item?.id) {
              set((state) => ({
                items: state.items.map((i) =>
                  i.id === item.id ? { ...i, cartItemId: data.item.id } : i
                ),
              }));
            }
          }
        } catch (err) {
          console.warn('[CartStore] Backend sync note:', err);
        }
      },

      removeItem: async (id, strapOptionId) => {
        const existing = get().items.find((i) => matchesVariant(i, id, strapOptionId));
        const cartItemId = existing?.cartItemId;

        set((state) => {
          if (strapOptionId !== undefined) {
            return {
              items: state.items.filter(
                (i) => !(matchesVariant(i, id, strapOptionId))
              ),
            };
          }
          return { items: state.items.filter((i) => i.id !== id && i.cartItemId !== id) };
        });

        if (cartItemId) {
          try {
            await fetch(`/api/cart/items/${cartItemId}`, { method: 'DELETE' });
          } catch (e) {
            console.warn('[CartStore] Delete sync note:', e);
          }
        }
      },

      updateQuantity: async (id, quantity, strapOptionId) => {
        const existing = get().items.find((i) => matchesVariant(i, id, strapOptionId));
        const cartItemId = existing?.cartItemId;
        const maxStock = existing?.stock ? Math.min(10, existing.stock) : 10;
        const cappedQty = Math.min(maxStock, Math.max(0, quantity));

        if (cappedQty <= 0) {
          get().removeItem(id, strapOptionId);
          return;
        }

        set((state) => ({
          items: state.items.map((i) => {
            if (matchesVariant(i, id, strapOptionId)) {
              return { ...i, quantity: cappedQty };
            }
            return i;
          }),
        }));

        if (cartItemId) {
          try {
            await fetch(`/api/cart/items/${cartItemId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ quantity: cappedQty }),
            });
          } catch (e) {
            console.warn('[CartStore] Update quantity sync note:', e);
          }
        }
      },

      clearCart: async () => {
        set({ items: [] });
        try {
          await fetch('/api/cart', { method: 'DELETE' });
        } catch (e) {
          console.warn('[CartStore] Clear cart sync note:', e);
        }
      },

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce(
          (sum, i) => sum + (i.price + (i.strapOption?.price_addon ?? 0)) * i.quantity,
          0
        ),
    }),
    { name: 'wristloom-cart' }
  )
);
