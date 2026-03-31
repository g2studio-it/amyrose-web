'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import {
  addToCartAction,
  updateCartItemByVariantAction,
  removeCartItemByVariantAction,
  clearCartAction,
} from '@/actions/cart';
import type { CartItemUI } from '@/types';

export const useCart = () => {
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  const items = useCartStore((s) => s.items);
  const storeAddItem = useCartStore((s) => s.addItem);
  const storeRemoveItem = useCartStore((s) => s.removeItem);
  const storeUpdateQuantity = useCartStore((s) => s.updateQuantity);
  const storeClearCart = useCartStore((s) => s.clearCart);
  const totalItems = useCartStore((s) => s.totalItems);
  const totalPrice = useCartStore((s) => s.totalPrice);

  const addItem = (item: CartItemUI) => {
    storeAddItem(item);
    // fire-and-forget backend sync (silently fails if unauthenticated)
    addToCartAction(item.productId, item.variantId, item.quantity).catch(() => {});
  };

  const removeItem = (variantId: string) => {
    storeRemoveItem(variantId);
    removeCartItemByVariantAction(variantId).catch(() => {});
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    storeUpdateQuantity(variantId, quantity);
    if (quantity <= 0) {
      removeCartItemByVariantAction(variantId).catch(() => {});
    } else {
      updateCartItemByVariantAction(variantId, quantity).catch(() => {});
    }
  };

  const clearCart = () => {
    storeClearCart();
    clearCartAction().catch(() => {});
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
