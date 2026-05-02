'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cartStore';
import {
  addToCartAction,
  updateCartItemByVariantAction,
  removeCartItemByVariantAction,
  clearCartAction,
} from '@/actions/cart';
import type { CartItemUI } from '@/types';

const cartKey = (userId: string) => `amyrose-cart-${userId}`;

export const useCart = () => {
  const { data: session, status } = useSession();
  const userId = session?.user?.id as string | undefined;

  const items = useCartStore((s) => s.items);
  const storeAddItem = useCartStore((s) => s.addItem);
  const storeRemoveItem = useCartStore((s) => s.removeItem);
  const storeUpdateQuantity = useCartStore((s) => s.updateQuantity);
  const storeClearCart = useCartStore((s) => s.clearCart);
  const storeSetItems = useCartStore((s) => s.setItems);
  const totalItems = useCartStore((s) => s.totalItems);
  const totalPrice = useCartStore((s) => s.totalPrice);

  // Load from user-scoped localStorage when a session is available
  useEffect(() => {
    if (!userId) return;
    // Remove legacy shared key (previous implementation)
    localStorage.removeItem('amyrose-cart');
    const stored = localStorage.getItem(cartKey(userId));
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as CartItemUI[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        storeSetItems(parsed);
      }
    } catch {
      localStorage.removeItem(cartKey(userId));
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep localStorage in sync with store changes (only while authenticated)
  useEffect(() => {
    if (!userId) return;
    const key = cartKey(userId);
    return useCartStore.subscribe((state) => {
      localStorage.setItem(key, JSON.stringify(state.items));
    });
  }, [userId]);

  // Clear in-memory store on logout
  useEffect(() => {
    if (status === 'unauthenticated') {
      storeClearCart();
    }
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const addItem = (item: CartItemUI) => {
    if (!userId) return;
    storeAddItem(item);
    addToCartAction(item.productId, item.variantId, item.quantity).catch(() => {});
  };

  const removeItem = (variantId: string) => {
    if (!userId) return;
    storeRemoveItem(variantId);
    removeCartItemByVariantAction(variantId).catch(() => {});
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (!userId) return;
    storeUpdateQuantity(variantId, quantity);
    if (quantity <= 0) {
      removeCartItemByVariantAction(variantId).catch(() => {});
    } else {
      updateCartItemByVariantAction(variantId, quantity).catch(() => {});
    }
  };

  const clearCart = () => {
    storeClearCart();
    if (userId) clearCartAction().catch(() => {});
  };

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems: totalItems(),
    totalPrice: totalPrice(),
  };
};
