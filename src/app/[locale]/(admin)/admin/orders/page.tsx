import { ShoppingBag } from 'lucide-react';

export default async function AdminOrdersPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#3B1F5E]">Pedidos</h1>
          <p className="mt-1 text-sm text-[#A98EC5]">Gestión de pedidos</p>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-[#6B1A2B]/20 bg-white py-20 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-[#A98EC5]/40" />
        <p className="mt-3 text-sm font-medium text-[#3B1F5E]">
          Próximamente
        </p>
        <p className="mt-1 text-xs text-[#A98EC5]">
          La gestión de pedidos estará disponible pronto.
        </p>
      </div>
    </div>
  );
}
