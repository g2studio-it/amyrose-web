import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function AdminProductsPage() {
  const locale = await getLocale();

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#3B1F5E]">Productos</h1>
          <p className="mt-1 text-sm text-[#A98EC5]">Gestión del catálogo</p>
        </div>
        <Button
          asChild
          className="bg-[#6B1A2B] hover:bg-[#6B1A2B]/90 text-white font-serif gap-2"
        >
          <Link href={`/${locale}/admin/products/new`}>
            <Plus className="h-4 w-4" />
            Nuevo producto
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border border-dashed border-[#6B1A2B]/20 bg-white py-20 text-center">
        <Package className="mx-auto h-10 w-10 text-[#A98EC5]/40" />
        <p className="mt-3 text-sm font-medium text-[#3B1F5E]">
          Próximamente
        </p>
        <p className="mt-1 text-xs text-[#A98EC5]">
          La gestión de productos estará disponible pronto.
        </p>
      </div>
    </div>
  );
}
