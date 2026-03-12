import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export async function getSession() {
  return await auth();
}

export async function requireAuth(locale = 'es') {
  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }
  return session;
}

export async function requireAdmin(locale = 'es') {
  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }
  if (session.user.role !== 'ADMIN') {
    redirect(`/${locale}`);
  }
  return session;
}
