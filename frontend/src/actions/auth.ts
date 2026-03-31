'use server';

import { signIn, signOut } from '@/auth';
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from '@/schemas/auth.schema';
import { AuthError } from 'next-auth';

const BACKEND_BASE = (process.env.BACKEND_API_URL ?? 'http://localhost:3001/api/v1').replace(/\/$/, '');

export async function loginAction(data: LoginInput) {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return { error: 'Datos inválidos' };
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Email o contraseña incorrectos' };
        default:
          return { error: 'Ocurrió un error al iniciar sesión' };
      }
    }
    return { error: 'Ocurrió un error inesperado' };
  }
}

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
    const json = await res.json().catch(() => ({}));
    const msg = json?.message ?? 'Error al crear la cuenta';
    return { error: Array.isArray(msg) ? msg[0] : msg };
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch {
    return { error: 'Cuenta creada. Por favor iniciá sesión.' };
  }
}

export async function logoutAction() {
  await signOut({ redirect: false });
}
