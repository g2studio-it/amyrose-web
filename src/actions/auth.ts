'use server';

import { signIn, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from '@/schemas/auth.schema';
import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';

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

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: 'Ya existe una cuenta con ese email' };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
    },
  });

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
