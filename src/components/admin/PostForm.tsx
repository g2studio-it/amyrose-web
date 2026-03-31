'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createPostAction, updatePostAction } from '@/actions/posts';

const schema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200),
  slug: z
    .string()
    .min(1, 'El slug es requerido')
    .max(250)
    .regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  excerpt: z.string().max(400).optional(),
  content: z.string().min(1, 'El contenido es requerido'),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  isPublished: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

interface Props {
  locale: string;
  postId?: string;
  defaultValues?: Partial<FormData>;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function PostForm({ locale, postId, defaultValues }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      isPublished: false,
      ...defaultValues,
    },
  });

  const isPublished = watch('isPublished');

  const handleTitleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const current = watch('slug');
    if (!current) {
      setValue('slug', slugify(e.target.value));
    }
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    const result = postId
      ? await updatePostAction(postId, data)
      : await createPostAction(data);
    setSaving(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(postId ? 'Noticia actualizada' : 'Noticia creada');
    router.push(`/${locale}/admin/news`);
    router.refresh();
  };

  const fieldClass = (hasError: boolean) =>
    `w-full rounded-lg border px-3 py-2 text-sm text-[#3B1F5E] placeholder:text-[#A98EC5]/50 focus:outline-none focus:ring-2 focus:ring-[#6B1A2B]/30 transition-shadow ${
      hasError ? 'border-red-300 bg-red-50' : 'border-[#6B1A2B]/20 bg-white'
    }`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <div className="rounded-xl border border-[#6B1A2B]/10 bg-white p-6 space-y-5">
        <h2 className="font-serif text-sm font-semibold text-[#3B1F5E]">
          Información básica
        </h2>

        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="title" className="text-xs font-medium text-[#3B1F5E] uppercase tracking-wide">
            Título *
          </Label>
          <input
            id="title"
            className={fieldClass(!!errors.title)}
            placeholder="Novedades de temporada..."
            {...register('title')}
            onBlur={handleTitleBlur}
          />
          {errors.title && (
            <p className="text-xs text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Slug */}
        <div className="space-y-1.5">
          <Label htmlFor="slug" className="text-xs font-medium text-[#3B1F5E] uppercase tracking-wide">
            Slug *
            <span className="ml-1.5 text-[10px] normal-case text-[#A98EC5]">
              (URL de la noticia)
            </span>
          </Label>
          <input
            id="slug"
            className={fieldClass(!!errors.slug)}
            placeholder="novedades-de-temporada"
            {...register('slug')}
          />
          {errors.slug && (
            <p className="text-xs text-red-500">{errors.slug.message}</p>
          )}
        </div>

        {/* Excerpt */}
        <div className="space-y-1.5">
          <Label htmlFor="excerpt" className="text-xs font-medium text-[#3B1F5E] uppercase tracking-wide">
            Resumen
            <span className="ml-1.5 text-[10px] normal-case text-[#A98EC5]">
              (aparece en el listado)
            </span>
          </Label>
          <Textarea
            id="excerpt"
            className={`${fieldClass(!!errors.excerpt)} resize-none`}
            rows={2}
            placeholder="Breve descripción de la noticia..."
            {...register('excerpt')}
          />
          {errors.excerpt && (
            <p className="text-xs text-red-500">{errors.excerpt.message}</p>
          )}
        </div>

        {/* Image URL */}
        <div className="space-y-1.5">
          <Label htmlFor="imageUrl" className="text-xs font-medium text-[#3B1F5E] uppercase tracking-wide">
            Imagen destacada
            <span className="ml-1.5 text-[10px] normal-case text-[#A98EC5]">(URL)</span>
          </Label>
          <input
            id="imageUrl"
            type="url"
            className={fieldClass(!!errors.imageUrl)}
            placeholder="https://..."
            {...register('imageUrl')}
          />
          {errors.imageUrl && (
            <p className="text-xs text-red-500">{errors.imageUrl.message}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-[#6B1A2B]/10 bg-white p-6 space-y-3">
        <h2 className="font-serif text-sm font-semibold text-[#3B1F5E]">
          Contenido *
        </h2>
        <Textarea
          id="content"
          className={`${fieldClass(!!errors.content)} resize-none font-mono text-xs`}
          rows={14}
          placeholder="Escribí el contenido completo de la noticia aquí..."
          {...register('content')}
        />
        {errors.content && (
          <p className="text-xs text-red-500">{errors.content.message}</p>
        )}
      </div>

      {/* Publish toggle + actions */}
      <div className="flex items-center justify-between rounded-xl border border-[#6B1A2B]/10 bg-white px-5 py-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              {...register('isPublished')}
            />
            <div
              onClick={() => setValue('isPublished', !isPublished)}
              className={`h-5 w-9 rounded-full transition-colors cursor-pointer ${
                isPublished ? 'bg-[#6B1A2B]' : 'bg-[#E5E7EB]'
              }`}
            >
              <div
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  isPublished ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-[#3B1F5E]">
              {isPublished ? 'Publicar ahora' : 'Guardar como borrador'}
            </p>
            <p className="text-xs text-[#A98EC5]">
              {isPublished
                ? 'La noticia será visible para todos'
                : 'Solo los administradores pueden ver los borradores'}
            </p>
          </div>
        </label>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            className="text-[#A98EC5] hover:text-[#3B1F5E]"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-[#6B1A2B] hover:bg-[#6B1A2B]/90 text-white font-serif min-w-[120px]"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? 'Guardando...' : postId ? 'Actualizar' : 'Guardar'}
          </Button>
        </div>
      </div>
    </form>
  );
}
