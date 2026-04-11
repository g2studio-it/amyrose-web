'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sl = () => (prisma as any).socialLink as typeof prisma.socialLink;

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') throw new Error('No autorizado');
}

export async function getSocialLinksAction() {
  return sl().findMany({
    orderBy: [{ sortOrder: 'asc' }, { platform: 'asc' }],
  });
}

export async function getActiveSocialLinksAction() {
  return sl().findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { platform: 'asc' }],
  });
}

export async function createSocialLinkAction(data: {
  platform: string;
  label: string;
  url: string;
  sortOrder: number;
}) {
  await requireAdmin();
  await sl().create({ data });
  revalidatePath('/[locale]/admin/news', 'page');
  revalidatePath('/[locale]/about', 'page');
  return { success: true };
}

export async function updateSocialLinkAction(
  id: string,
  data: { platform?: string; label?: string; url?: string; isActive?: boolean; sortOrder?: number },
) {
  await requireAdmin();
  await sl().update({ where: { id }, data });
  revalidatePath('/[locale]/admin/news', 'page');
  revalidatePath('/[locale]/about', 'page');
  return { success: true };
}

export async function deleteSocialLinkAction(id: string) {
  await requireAdmin();
  await sl().delete({ where: { id } });
  revalidatePath('/[locale]/admin/news', 'page');
  revalidatePath('/[locale]/about', 'page');
  return { success: true };
}
