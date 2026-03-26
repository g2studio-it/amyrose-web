import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { Plus, FileText, Eye, EyeOff, Pencil } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DeletePostButton } from '@/components/admin/DeletePostButton';
import { TogglePublishButton } from '@/components/admin/TogglePublishButton';

async function getPosts() {
  return prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { name: true } } },
  });
}

export default async function AdminNewsPage() {
  const locale = await getLocale();
  const posts = await getPosts();

  const published = posts.filter((p) => p.isPublished).length;
  const drafts = posts.length - published;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#3B1F5E]">Noticias</h1>
          <p className="mt-1 text-sm text-[#A98EC5]">
            {published} publicadas · {drafts} borradores
          </p>
        </div>
        <Button
          asChild
          className="bg-[#6B1A2B] hover:bg-[#6B1A2B]/90 text-white font-serif gap-2"
        >
          <Link href={`/${locale}/admin/news/new`}>
            <Plus className="h-4 w-4" />
            Nueva noticia
          </Link>
        </Button>
      </div>

      {/* Empty state */}
      {posts.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#6B1A2B]/20 bg-white py-16 text-center">
          <FileText className="mx-auto h-10 w-10 text-[#A98EC5]/50" />
          <p className="mt-3 text-sm font-medium text-[#3B1F5E]">
            No hay noticias publicadas
          </p>
          <p className="mt-1 text-xs text-[#A98EC5]">
            Creá tu primera noticia para comunicar novedades a tus clientes.
          </p>
          <Button
            asChild
            size="sm"
            className="mt-5 bg-[#6B1A2B] hover:bg-[#6B1A2B]/90 text-white font-serif"
          >
            <Link href={`/${locale}/admin/news/new`}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Crear noticia
            </Link>
          </Button>
        </div>
      )}

      {/* Posts table */}
      {posts.length > 0 && (
        <div className="rounded-xl border border-[#6B1A2B]/10 bg-white overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto] text-[10px] uppercase tracking-widest text-[#A98EC5] font-semibold px-5 py-3 border-b border-[#6B1A2B]/08 bg-[#FAFAFA]">
            <span>Título</span>
            <span className="px-4 text-center">Estado</span>
            <span className="px-4 text-center">Fecha</span>
            <span className="pr-1">Acciones</span>
          </div>

          <ul className="divide-y divide-[#6B1A2B]/06">
            {posts.map((post) => (
              <li
                key={post.id}
                className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 px-5 py-4 hover:bg-[#FAFAFA] transition-colors"
              >
                {/* Title + excerpt */}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#3B1F5E]">
                    {post.title}
                  </p>
                  {post.excerpt && (
                    <p className="mt-0.5 truncate text-xs text-[#A98EC5]">
                      {post.excerpt}
                    </p>
                  )}
                  <p className="mt-0.5 text-[10px] text-[#A98EC5]/60">
                    Por {post.author.name ?? '—'}
                  </p>
                </div>

                {/* Status badge */}
                <div className="px-4 text-center">
                  <Badge
                    variant="outline"
                    className={
                      post.isPublished
                        ? 'border-green-200 bg-green-50 text-green-700 text-[10px]'
                        : 'border-yellow-200 bg-yellow-50 text-yellow-700 text-[10px]'
                    }
                  >
                    {post.isPublished ? (
                      <><Eye className="mr-1 h-2.5 w-2.5" />Publicada</>
                    ) : (
                      <><EyeOff className="mr-1 h-2.5 w-2.5" />Borrador</>
                    )}
                  </Badge>
                </div>

                {/* Date */}
                <div className="px-4 text-center">
                  <p className="text-xs text-[#A98EC5]">
                    {post.publishedAt
                      ? formatDate(post.publishedAt)
                      : formatDate(post.createdAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <TogglePublishButton
                    postId={post.id}
                    isPublished={post.isPublished}
                  />
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[#3B1F5E]/50 hover:text-[#3B1F5E] hover:bg-[#F9F5FB]"
                  >
                    <Link href={`/${locale}/admin/news/${post.id}/edit`}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <DeletePostButton postId={post.id} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
