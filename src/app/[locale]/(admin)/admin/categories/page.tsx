import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { Plus, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function AdminCategoriesPage() {
  const locale = await getLocale();

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#3B1F5E]">Categorías</h1>
          <p className="mt-1 text-sm text-[#A98EC5]">Organización del catálogo</p>
        </div>
        <Button
          asChild
          className="bg-[#6B1A2B] hover:bg-[#6B1A2B]/90 text-white font-serif gap-2"
          disabled
        >
          <span>
            <Plus className="h-4 w-4" />
            Nueva categoría
          </span>
        </Button>
      </div>

      <div className="rounded-xl border border-dashed border-[#6B1A2B]/20 bg-white py-20 text-center">
        <Tag className="mx-auto h-10 w-10 text-[#A98EC5]/40" />
        <p className="mt-3 text-sm font-medium text-[#3B1F5E]">
          Próximamente
        </p>
        <p className="mt-1 text-xs text-[#A98EC5]">
          La gestión de categorías estará disponible pronto.
        </p>
      </div>
    </div>
  );
}
