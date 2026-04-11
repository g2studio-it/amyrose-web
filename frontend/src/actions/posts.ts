'use server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const postSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200),
  slug: z
    .string()
    .min(1, 'El slug es requerido')
    .max(250)
    .regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  excerpt: z.string().max(400).optional(),
  content: z.string().min(1, 'El contenido es requerido'),
  imageUrl: z
    .string()
    .url('URL de imagen inválida')
    .optional()
    .or(z.literal('')),
  isPublished: z.boolean().default(false),
});

export type PostFormData = z.infer<typeof postSchema>;

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('No autorizado');
  }
  return session.user;
}

export async function createPostAction(data: PostFormData) {
  const user = await requireAdmin();

  const parsed = postSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  }

  const existing = await prisma.post.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existing) {
    return { error: 'Ya existe una publicación con ese slug' };
  }

  const { imageUrl, ...rest } = parsed.data;

  const post = await prisma.post.create({
    data: {
      ...rest,
      imageUrl: imageUrl || null,
      authorId: user.id as string,
      publishedAt: parsed.data.isPublished ? new Date() : null,
    },
  });

  revalidatePath('/[locale]/admin/news', 'page');
  return { success: true, id: post.id };
}

export async function updatePostAction(id: string, data: PostFormData) {
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return { error: 'Publicación no encontrada' };

  await requireAdmin();

  const parsed = postSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  }

  const slugConflict = await prisma.post.findFirst({
    where: { slug: parsed.data.slug, NOT: { id } },
  });
  if (slugConflict) {
    return { error: 'Ya existe otra publicación con ese slug' };
  }

  const { imageUrl, ...rest } = parsed.data;

  await prisma.post.update({
    where: { id },
    data: {
      ...rest,
      imageUrl: imageUrl || null,
      publishedAt:
        parsed.data.isPublished && !existing.publishedAt
          ? new Date()
          : existing.publishedAt,
    },
  });

  revalidatePath('/[locale]/admin/news', 'page');
  return { success: true };
}

export async function togglePublishAction(id: string, publish: boolean) {
  await requireAdmin();

  await prisma.post.update({
    where: { id },
    data: {
      isPublished: publish,
      publishedAt: publish ? new Date() : null,
    },
  });

  revalidatePath('/[locale]/admin/news', 'page');
  return { success: true };
}

export async function deletePostAction(id: string) {
  await requireAdmin();

  await prisma.post.delete({ where: { id } });

  revalidatePath('/[locale]/admin/news', 'page');
  return { success: true };
}
