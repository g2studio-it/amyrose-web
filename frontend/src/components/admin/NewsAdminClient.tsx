'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Newspaper, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ArticleFormDialog } from '@/components/admin/ArticleFormDialog';
import { deletePostAction, togglePublishAction } from '@/actions/posts';

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  imageUrl: string | null;
  isPublished: boolean;
  createdAt: Date;
};

interface Props {
  posts: Post[];
}

export function NewsAdminClient({ posts }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const handleDeletePost = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      const result = await deletePostAction(id);
      if (!result.success) toast.error('Error al eliminar');
      else { toast.success('Artículo eliminado'); router.refresh(); }
      setDeletingId(null);
    });
  };

  const handleTogglePublish = (id: string, current: boolean) => {
    setTogglingId(id);
    startTransition(async () => {
      await togglePublishAction(id, !current);
      router.refresh();
      setTogglingId(null);
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-nav-purple">Contenido</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Gestión de artículos del sitio</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{posts.length} artículos</p>
          <ArticleFormDialog />
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground/70">
              <Newspaper className="h-10 w-10 opacity-30" />
              <p className="text-sm">No hay artículos aún</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {posts.map((post) => (
                <div key={post.id} className="flex items-start gap-4 px-5 py-4 hover:bg-muted transition-colors">
                  {post.imageUrl ? (
                    <img src={post.imageUrl} alt={post.title} className="h-14 w-14 rounded-xl object-cover border border-border shrink-0" />
                  ) : (
                    <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <Newspaper className="h-5 w-5 text-[#A98EC5]" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-nav-purple truncate">{post.title}</p>
                      <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${post.isPublished ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-muted text-muted-foreground'}`}>
                        {post.isPublished ? 'Publicado' : 'Borrador'}
                      </span>
                    </div>
                    {post.excerpt && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{post.excerpt}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/50 mt-1">
                      {new Date(post.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleTogglePublish(post.id, post.isPublished)}
                      disabled={togglingId === post.id}
                      aria-label={post.isPublished ? 'Despublicar' : 'Publicar'}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground/70 hover:bg-muted hover:text-nav-purple transition-colors disabled:opacity-40"
                    >
                      {togglingId === post.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : post.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />
                      }
                    </button>
                    <ArticleFormDialog post={post} />
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      disabled={deletingId === post.id}
                      aria-label="Eliminar artículo"
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
                    >
                      {deletingId === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
