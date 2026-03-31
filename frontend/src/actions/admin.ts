'use server';

import { auth } from '@/auth';
import { api, type ApiProduct, type ApiOrder, type ApiUser, type PaginatedResult } from '@/lib/api';
import { revalidatePath } from 'next/cache';

async function getAdminToken(): Promise<string> {
  const session = await auth();
  if (!session?.user?.backendAccessToken) throw new Error('No autorizado');
  return session.user.backendAccessToken;
}

export async function getDashboardStatsAction(): Promise<{
  revenue: number;
  orders: number;
  products: number;
  customers: number;
}> {
  const token = await getAdminToken();

  const [ordersResult, productsResult, usersResult] = await Promise.all([
    api.get<PaginatedResult<ApiOrder>>('/orders?limit=200', token),
    api.get<PaginatedResult<ApiProduct>>('/catalog/products?limit=1', token),
    api.get<PaginatedResult<ApiUser>>('/users?limit=1', token),
  ]);

  const revenue = ordersResult.data
    .filter((o) => o.paymentStatus === 'APPROVED')
    .reduce((sum, o) => sum + o.total, 0);

  return {
    revenue,
    orders: ordersResult.total,
    products: productsResult.total,
    customers: usersResult.total,
  };
}

export async function getAdminProductsAction(
  page = 1,
  limit = 20,
): Promise<PaginatedResult<ApiProduct>> {
  const token = await getAdminToken();
  return api.get<PaginatedResult<ApiProduct>>(
    `/catalog/products?page=${page}&limit=${limit}`,
    token,
  );
}

export async function deleteAdminProductAction(id: string): Promise<void> {
  const token = await getAdminToken();
  await api.delete(`/catalog/products/${id}`, token);
  revalidatePath('/[locale]/admin/products', 'page');
}

export async function getAdminOrdersAction(
  page = 1,
  limit = 20,
): Promise<PaginatedResult<ApiOrder>> {
  const token = await getAdminToken();
  return api.get<PaginatedResult<ApiOrder>>(`/orders?page=${page}&limit=${limit}`, token);
}

export async function updateOrderStatusAction(id: string, status: string): Promise<void> {
  const token = await getAdminToken();
  await api.patch(`/orders/${id}/status`, { status }, token);
  revalidatePath('/[locale]/admin/orders', 'page');
}

export async function getAdminUsersAction(
  page = 1,
  limit = 20,
): Promise<PaginatedResult<ApiUser>> {
  const token = await getAdminToken();
  return api.get<PaginatedResult<ApiUser>>(`/users?page=${page}&limit=${limit}`, token);
}
