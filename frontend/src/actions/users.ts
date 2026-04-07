'use server';

import { auth } from '@/auth';
import { api, type ApiUser } from '@/lib/api';
import type { UpdateProfileInput } from '@/schemas/profile.schema';

async function getTokenAndId(): Promise<{ token: string; userId: string } | null> {
  const session = await auth();
  if (!session?.user?.backendAccessToken || !session.user.id) return null;
  return { token: session.user.backendAccessToken, userId: session.user.id };
}

export async function getProfileAction(): Promise<ApiUser | null> {
  const credentials = await getTokenAndId();
  if (!credentials) return null;
  try {
    return await api.get<ApiUser>(`/users/${credentials.userId}`, credentials.token);
  } catch {
    return null;
  }
}

export async function updateProfileAction(
  data: UpdateProfileInput,
): Promise<{ error?: string }> {
  const credentials = await getTokenAndId();
  if (!credentials) return { error: 'No autenticado' };

  try {
    const payload: Record<string, string> = {};
    if (data.name) payload.name = data.name;
    if (data.phone !== undefined) payload.phone = data.phone;

    await api.patch<ApiUser>(`/users/${credentials.userId}`, payload, credentials.token);
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al actualizar el perfil' };
  }
}
