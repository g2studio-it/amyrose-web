'use server';

import { signIn, signOut } from '@/auth';
import { registerSchema, type RegisterInput } from '@/schemas/auth.schema';

const BACKEND_BASE = (process.env.BACKEND_API_URL ?? 'http://localhost:3001/api/v1').replace(/\/$/, '');

export async function registerAction(data: RegisterInput) {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: 'Datos inválidos' };
  }

  const { name, email, password, phone } = parsed.data;

  const res = await fetch(`${BACKEND_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, phone }),
  });

  if (!res.ok) {
    if (res.status === 409) return { error: 'No se pudo completar el registro. Intentá con otro email o iniciá sesión.' };
    if (res.status === 400) return { error: 'Los datos ingresados no son válidos.' };
    return { error: 'Error al crear la cuenta. Intentá de nuevo.' };
  }

  try {
    await signIn('credentials', { email, password, redirect: false });
    return { success: true };
  } catch {
    return { error: 'Cuenta creada. Por favor iniciá sesión.' };
  }
}

export async function logoutAction() {
  await signOut({ redirect: false });
}
