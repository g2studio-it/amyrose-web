import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { getAdminOrdersAction } from '@/actions/admin';
import { OrderStatusSelect } from '@/components/admin/OrderStatusSelect';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

const PAYMENT_COLORS: Record<string, string> = {
  PENDING:  'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  APPROVED: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  REJECTED: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  REFUNDED: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
};

const PAYMENT_LABELS: Record<string, string> = {
  PENDING:  'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  REFUNDED: 'Reembolsado',
};

export default async function AdminOrdersPage({ params, searchParams }: Props) {
  const [{ locale }, { page: pageParam }] = await Promise.all([params, searchParams]);

  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect(`/${locale}/login`);
  }

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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-nav-purple">Pedidos</h1>
        <p className="text-sm text-nav-purple/50 mt-0.5">{result.total} pedidos en total</p>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-nav-lilac-divider/50 overflow-hidden">
        {result.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-nav-purple/40">
            <ShoppingBag className="h-10 w-10 opacity-30" />
            <p className="text-sm">No hay pedidos aún</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-section-tinted text-nav-purple/50 text-xs uppercase tracking-wide">
                  <th className="px-6 py-3 text-left font-medium">ID</th>
                  <th className="px-6 py-3 text-left font-medium">Items</th>
                  <th className="px-6 py-3 text-left font-medium">Total</th>
                  <th className="px-6 py-3 text-left font-medium">Estado</th>
                  <th className="px-6 py-3 text-left font-medium">Pago</th>
                  <th className="px-6 py-3 text-left font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#6B1A2B]/6">
                {result.data.map((order) => (
                  <tr key={order.id} className="hover:bg-section-tinted transition-colors">
                    {/* ID */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-mono text-xs font-semibold text-[#6B1A2B]">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-xs text-nav-purple/40 mt-0.5 font-mono">
                          {order.userId.slice(0, 8)}…
                        </p>
                      </div>
                    </td>

                    {/* Items summary */}
                    <td className="px-6 py-4 text-nav-purple/60 text-xs max-w-48">
                      <div className="space-y-0.5">
                        {order.items.slice(0, 2).map((item) => (
                          <p key={item.id} className="truncate">
                            {item.quantity}× {item.productName} ({item.variantName})
                          </p>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-nav-purple/40">+{order.items.length - 2} más</p>
                        )}
                      </div>
                    </td>

                    {/* Total */}
                    <td className="px-6 py-4">
                      <p className="font-semibold text-nav-purple">
                        ${Number(order.total).toLocaleString('es-AR')}
                      </p>
                      {Number(order.deliveryFee) > 0 && (
                        <p className="text-xs text-nav-purple/40 mt-0.5">
                          + ${Number(order.deliveryFee).toLocaleString('es-AR')} envío
                        </p>
                      )}
                    </td>

                    {/* Status (editable) */}
                    <td className="px-6 py-4">
                      <OrderStatusSelect
                        orderId={order.id}
                        currentStatus={order.status}
                      />
                    </td>

                    {/* Payment status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          PAYMENT_COLORS[order.paymentStatus] ?? 'bg-gray-50 text-gray-600'
                        }`}
                      >
                        {PAYMENT_LABELS[order.paymentStatus] ?? order.paymentStatus}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-nav-purple/50 text-xs whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-nav-purple/50">
          <span>
            Mostrando {(page - 1) * result.limit + 1}–
            {Math.min(page * result.limit, result.total)} de {result.total}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/${locale}/admin/orders?page=${page - 1}`}
                className="px-3 py-1.5 rounded-lg border border-nav-lilac-divider/60 hover:bg-section-tinted text-nav-purple transition-colors"
              >
                ← Anterior
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/${locale}/admin/orders?page=${page + 1}`}
                className="px-3 py-1.5 rounded-lg border border-nav-lilac-divider/60 hover:bg-section-tinted text-nav-purple transition-colors"
              >
                Siguiente →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
