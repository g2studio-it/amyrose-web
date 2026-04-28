'use server';

import { auth } from '@/auth';
import { api, type ApiOrder, type PaginatedResult } from '@/lib/api';

interface CartItemInput {
  productId: string;
  variantId: string;
  quantity: number;
}

async function getToken(): Promise<string | undefined> {
  const session = await auth();
  return session?.user?.backendAccessToken;
}

export async function getOrdersAction(): Promise<ApiOrder[]> {
  const token = await getToken();
  if (!token) return [];
  try {
    const result = await api.get<PaginatedResult<ApiOrder>>('/orders?limit=50', token);
    return result.data;
  } catch {
    return [];
  }
}

export async function getOrderAction(id: string): Promise<ApiOrder | null> {
  const token = await getToken();
  if (!token) return null;
  try {
    return await api.get<ApiOrder>(`/orders/${id}`, token);
  } catch {
    return null;
  }
}

export async function createOrderAction(
  notes?: string,
  items?: CartItemInput[],
): Promise<ApiOrder> {
  const token = await getToken();
  if (!token) throw new Error('No autenticado');
  return api.post<ApiOrder>('/orders', { notes, items }, token);
}

export async function cancelOrderAction(id: string): Promise<ApiOrder> {
  const token = await getToken();
  if (!token) throw new Error('No autenticado');
  return api.patch<ApiOrder>(`/orders/${id}/cancel`, {}, token);
}
