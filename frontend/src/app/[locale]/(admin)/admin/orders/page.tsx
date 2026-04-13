import { getAdminOrdersAction } from '@/actions/admin';
import { OrdersTable } from '@/components/admin/OrdersTable';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminOrdersPage({ params, searchParams }: Props) {
  const [{ locale }, { page: pageParam }] = await Promise.all([params, searchParams]);

  const page = Math.max(1, Number(pageParam ?? 1));
  const result = await getAdminOrdersAction(page, 20).catch(() => ({
    data: [],
    total: 0,
    page,
    limit: 20,
  }));

  const totalPages = Math.ceil(result.total / result.limit);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-nav-purple">Pedidos</h1>
        <p className="text-sm text-nav-purple/50 mt-0.5">{result.total} pedidos en total</p>
      </div>

      <div className="bg-white dark:bg-card rounded-xl border border-nav-burgundy/10 dark:border-dm-secondary/20 overflow-hidden">
        <OrdersTable orders={result.data} />
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-nav-purple/50">
          <span>
            Mostrando {(page - 1) * result.limit + 1}–
            {Math.min(page * result.limit, result.total)} de {result.total}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <a href={`/${locale}/admin/orders?page=${page - 1}`} className="px-3 py-1.5 rounded-lg border border-nav-burgundy/15 hover:bg-[#F9F5FB] dark:hover:bg-[#3D3845] text-nav-purple transition-colors">
                ← Anterior
              </a>
            )}
            {page < totalPages && (
              <a href={`/${locale}/admin/orders?page=${page + 1}`} className="px-3 py-1.5 rounded-lg border border-nav-burgundy/15 hover:bg-[#F9F5FB] dark:hover:bg-[#3D3845] text-nav-purple transition-colors">
                Siguiente →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
