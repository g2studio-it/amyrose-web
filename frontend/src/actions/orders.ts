'use server';

import { auth } from '@/auth';
import { api, type ApiOrder, type PaginatedResult } from '@/lib/api';
import { prisma } from '@/lib/prisma';

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

export async function attachProofAction(orderId: string, proofUrl: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('No autenticado');

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id },
    select: { notes: true },
  });
  if (!order) throw new Error('Pedido no encontrado');

  await prisma.order.update({
    where: { id: orderId },
    data: {
      notes: [order.notes, `Comprobante: ${proofUrl}`].filter(Boolean).join('\n'),
    },
  });
}
