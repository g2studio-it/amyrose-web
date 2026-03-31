import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { PostForm } from '@/components/admin/PostForm';

export default async function NewPostPage() {
  const locale = await getLocale();

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/${locale}/admin/news`}
          className="flex items-center gap-1.5 text-sm text-[#A98EC5] hover:text-[#3B1F5E] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver a noticias
        </Link>
      </div>
      <div>
        <h1 className="font-serif text-2xl font-bold text-[#3B1F5E]">
          Nueva noticia
        </h1>
        <p className="mt-1 text-sm text-[#A98EC5]">
          Completá los campos y publicá cuando esté lista.
        </p>
      </div>

      <PostForm locale={locale} />
    </div>
  );
}
