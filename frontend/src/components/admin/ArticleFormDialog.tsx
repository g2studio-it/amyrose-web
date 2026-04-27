'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createPostAction, updatePostAction, type PostFormData } from '@/actions/posts';
import { ImageUpload } from '@/components/ui/image-upload';

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  imageUrl: string | null;
  isPublished: boolean;
};

interface Props {
  post?: Post;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

const FIELD =
  'w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-nav-purple placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30';

export function ArticleFormDialog({ post }: Props) {
  const isEdit = !!post;
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '');
  const [content, setContent] = useState(post?.content ?? '');
  const [imageUrl, setImageUrl] = useState(post?.imageUrl ?? '');
  const [isPublished, setIsPublished] = useState(post?.isPublished ?? false);
  const [slugManual, setSlugManual] = useState(isEdit);

  useEffect(() => {
    if (!slugManual) setSlug(slugify(title));
  }, [title, slugManual]);

  const handleOpen = () => {
    if (isEdit) {
      setTitle(post.title);
      setSlug(post.slug);
      setExcerpt(post.excerpt ?? '');
      setContent(post.content);
      setImageUrl(post.imageUrl ?? '');
      setIsPublished(post.isPublished);
    }
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: PostFormData = { title, slug, excerpt: excerpt || undefined, content, imageUrl: imageUrl || undefined, isPublished };

    startTransition(async () => {
      const result = isEdit
        ? await updatePostAction(post.id, data)
        : await createPostAction(data);

      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(isEdit ? 'Artículo actualizado' : 'Artículo creado');
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className={
          isEdit
            ? 'inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground/70 hover:bg-muted hover:text-nav-purple transition-colors'
            : 'inline-flex items-center gap-2 rounded-xl bg-[#6B1A2B] px-4 py-2 text-sm font-medium text-white hover:bg-[#6B1A2B]/85 transition-colors'
        }
        aria-label={isEdit ? 'Editar artículo' : undefined}
      >
        {isEdit ? <Pencil className="h-4 w-4" /> : <><Plus className="h-4 w-4" /> Nuevo artículo</>}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-serif font-bold text-lg text-nav-purple">
                {isEdit ? 'Editar artículo' : 'Nuevo artículo'}
              </h2>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-muted-foreground/70 hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Título *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className={FIELD} placeholder="Mi artículo" required />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Slug *</label>
                <input
                  value={slug}
                  onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
                  className={FIELD}
                  placeholder="mi-articulo"
                  required
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Descripción</label>
                <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className={`${FIELD} resize-none`} placeholder="Breve descripción del artículo..." />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Contenido *</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5} className={`${FIELD} resize-none`} placeholder="Contenido completo..." required />
              </div>

              {/* Image */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Imagen
                </label>
                <ImageUpload
                  value={imageUrl}
                  onChange={setImageUrl}
                  folder="amyrose/posts"
                  previewClassName="h-32 w-full"
                />
              </div>

              {/* Published */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  onClick={() => setIsPublished((v) => !v)}
                  className={`relative h-5 w-9 rounded-full transition-colors ${isPublished ? 'bg-[#6B1A2B]' : 'bg-border'}`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-card shadow transition-transform ${isPublished ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-muted-foreground">Publicado</span>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-nav-purple transition-colors">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#6B1A2B] text-white text-sm font-medium hover:bg-[#6B1A2B]/85 disabled:opacity-50 transition-colors"
                >
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {isEdit ? 'Guardar cambios' : 'Crear artículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
