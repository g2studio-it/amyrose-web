'use server';

import { auth } from '@/auth';
import {
  api,
  type ApiProduct,
  type ApiOrder,
  type ApiUser,
  type ApiCategory,
  type PaginatedResult,
} from '@/lib/api';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

async function getAdminToken(): Promise<string> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') throw new Error('No autorizado');
  if (!session.user.backendAccessToken) throw new Error('No autorizado');
  return session.user.backendAccessToken;
}

export async function getDashboardStatsAction(): Promise<{
  revenue: number;
  orders: number;
  products: number;
  customers: number;
}> {
  const [orders, products, customers, revenueOrders] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.findMany({
      where: { paymentStatus: 'APPROVED' },
      select: { total: true },
    }),
  ]);

  const revenue = revenueOrders.reduce(
    (sum, o) => sum + Number(o.total),
    0,
  );

  return { revenue, orders, products, customers };
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

export async function toggleUserActiveAction(
  id: string,
  isActive: boolean,
): Promise<void> {
  const token = await getAdminToken();
  await api.patch(`/users/${id}`, { isActive }, token);
  revalidatePath('/[locale]/admin/customers', 'page');
}

export async function getAdminCategoriesAction(): Promise<ApiCategory[]> {
  const token = await getAdminToken();
  return api.get<ApiCategory[]>('/catalog/categories', token);
}

export async function createAdminCategoryAction(data: {
  name: string;
  slug: string;
  description?: string;
}): Promise<{ error?: string }> {
  try {
    const token = await getAdminToken();
    await api.post<ApiCategory>('/catalog/categories', data, token);
    revalidatePath('/[locale]/admin/categories', 'page');
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al crear categoría' };
  }
}

export async function createAdminProductAction(data: {
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  isFeatured?: boolean;
  variants: { name: string; price: number; stock?: number; sku?: string }[];
}): Promise<{ error?: string; productId?: string }> {
  try {
    const token = await getAdminToken();
    const product = await api.post<ApiProduct>('/catalog/products', data, token);
    revalidatePath('/[locale]/admin/products', 'page');
    return { productId: product.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al crear producto' };
  }
}

export async function updateAdminProductAction(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string;
    isFeatured: boolean;
    isActive: boolean;
    categoryId: string;
  }>,
): Promise<{ error?: string }> {
  try {
    const token = await getAdminToken();
    await api.patch<ApiProduct>(`/catalog/products/${id}`, data, token);
    revalidatePath('/[locale]/admin/products', 'page');
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al actualizar producto' };
  }
}

// ── Product Images ──────────────────────────────────────────────────────────

export async function addProductImageAction(
  productId: string,
  data: { url: string; altText?: string; isPrimary?: boolean },
): Promise<{ error?: string }> {
  try {
    const token = await getAdminToken();
    await api.post(`/catalog/products/${productId}/images`, data, token);
    revalidatePath('/[locale]/admin/products', 'page');
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al agregar imagen' };
  }
}

export async function updateProductImageAction(
  productId: string,
  imageId: string,
  data: { altText?: string; isPrimary?: boolean },
): Promise<{ error?: string }> {
  try {
    const token = await getAdminToken();
    await api.patch(`/catalog/products/${productId}/images/${imageId}`, data, token);
    revalidatePath('/[locale]/admin/products', 'page');
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al actualizar imagen' };
  }
}

export async function deleteProductImageAction(
  productId: string,
  imageId: string,
): Promise<{ error?: string }> {
  try {
    const token = await getAdminToken();
    await api.delete(`/catalog/products/${productId}/images/${imageId}`, token);
    revalidatePath('/[locale]/admin/products', 'page');
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al eliminar imagen' };
  }
}

// ── Product Variants ────────────────────────────────────────────────────────

export async function addProductVariantAction(
  productId: string,
  data: { name: string; price: number; stock?: number; sku?: string },
): Promise<{ error?: string }> {
  try {
    const token = await getAdminToken();
    await api.post(`/catalog/products/${productId}/variants`, data, token);
    revalidatePath('/[locale]/admin/products', 'page');
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al agregar variante' };
  }
}

export async function updateProductVariantAction(
  productId: string,
  variantId: string,
  data: Partial<{ name: string; price: number; stock: number; sku: string; isActive: boolean }>,
): Promise<{ error?: string }> {
  try {
    const token = await getAdminToken();
    await api.patch(`/catalog/products/${productId}/variants/${variantId}`, data, token);
    revalidatePath('/[locale]/admin/products', 'page');
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al actualizar variante' };
  }
}

export async function deleteProductVariantAction(
  productId: string,
  variantId: string,
): Promise<{ error?: string }> {
  try {
    const token = await getAdminToken();
    await api.delete(`/catalog/products/${productId}/variants/${variantId}`, token);
    revalidatePath('/[locale]/admin/products', 'page');
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al eliminar variante' };
  }
}
