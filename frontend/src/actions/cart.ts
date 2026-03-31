'use server';

import { auth } from '@/auth';
import { api, type ApiCart } from '@/lib/api';

async function getToken(): Promise<string | undefined> {
  const session = await auth();
  return session?.user?.backendAccessToken;
}

export async function getCartAction(): Promise<ApiCart | null> {
  const token = await getToken();
  if (!token) return null;
  try {
    return await api.get<ApiCart>('/cart', token);
  } catch {
    return null;
  }
}

export async function addToCartAction(
  productId: string,
  variantId: string,
  quantity: number,
): Promise<void> {
  const token = await getToken();
  if (!token) return;
  await api.post('/cart/items', { productId, variantId, quantity }, token);
}

/**
 * Update quantity of a cart item identified by variantId.
 * Fetches the cart to resolve the backend item UUID first.
 */
export async function updateCartItemByVariantAction(
  variantId: string,
  quantity: number,
): Promise<void> {
  const token = await getToken();
  if (!token) return;
  const cart = await api.get<ApiCart>('/cart', token);
  const item = cart.items.find((i) => i.variantId === variantId);
  if (!item) return;
  await api.patch(`/cart/items/${item.id}`, { quantity }, token);
}

/**
 * Remove a cart item identified by variantId.
 * Fetches the cart to resolve the backend item UUID first.
 */
export async function removeCartItemByVariantAction(variantId: string): Promise<void> {
  const token = await getToken();
  if (!token) return;
  const cart = await api.get<ApiCart>('/cart', token);
  const item = cart.items.find((i) => i.variantId === variantId);
  if (!item) return;
  await api.delete(`/cart/items/${item.id}`, token);
}

export async function clearCartAction(): Promise<void> {
  const token = await getToken();
  if (!token) return;
  await api.delete('/cart', token);
}
