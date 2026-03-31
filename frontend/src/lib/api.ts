const BASE = (process.env.BACKEND_API_URL ?? 'http://localhost:3001/api/v1').replace(/\/$/, '');

async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...init } = options;
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`[API] ${res.status} ${path}: ${text}`);
  }

  if (res.status === 204) return undefined as T;
  const json = await res.json();
  // Unwrap NestJS TransformInterceptor envelope: { success, data, timestamp }
  if (json && typeof json === 'object' && json.success === true && 'data' in json) {
    return json.data as T;
  }
  return json as T;
}

export const api = {
  get: <T>(path: string, token?: string, opts?: RequestInit) =>
    apiFetch<T>(path, { cache: 'no-store', ...opts, token }),
  post: <T>(path: string, body: unknown, token?: string) =>
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body), token }),
  patch: <T>(path: string, body: unknown, token?: string) =>
    apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body), token }),
  delete: <T = void>(path: string, token?: string) =>
    apiFetch<T>(path, { method: 'DELETE', token }),
};

// ── Shared response types ───────────────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiImage {
  id: string;
  url: string;
  isPrimary: boolean;
  altText: string | null;
  sortOrder: number;
}

export interface ApiVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
  sortOrder: number;
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  categoryId: string;
  category: ApiCategory;
  images: ApiImage[];
  variants: ApiVariant[];
}

export interface ApiCartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId: string;
  quantity: number;
}

export interface ApiCart {
  id: string;
  userId: string;
  items: ApiCartItem[];
}

export interface ApiOrder {
  id: string;
  userId: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: ApiOrderItem[];
}

export interface ApiOrderItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface BackendAuthResponse {
  user: { id: string; email: string; name: string; role: string };
  accessToken: string;
  refreshToken: string;
}

export interface ApiUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}
