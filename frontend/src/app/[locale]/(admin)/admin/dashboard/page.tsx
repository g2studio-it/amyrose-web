import { TrendingUp, ShoppingBag, Package, Users } from 'lucide-react';
import { getDashboardStatsAction, getAdminOrdersAction } from '@/actions/admin';

interface Props {
  params: Promise<{ locale: string }>;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:    'bg-yellow-100 text-yellow-800',
  CONFIRMED:  'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  READY:      'bg-green-100 text-green-800',
  DELIVERED:  'bg-gray-100 text-gray-700',
  CANCELLED:  'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING:    'Pendiente',
  CONFIRMED:  'Confirmado',
  PROCESSING: 'En preparación',
  READY:      'Listo',
  DELIVERED:  'Entregado',
  CANCELLED:  'Cancelado',
};

const PAYMENT_LABELS: Record<string, string> = {
  PENDING:  'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  REFUNDED: 'Reembolsado',
};

export default async function AdminDashboardPage({ params }: Props) {
  const { locale } = await params;

  const [stats, recentOrders] = await Promise.all([
    getDashboardStatsAction().catch(() => ({ revenue: 0, orders: 0, products: 0, customers: 0 })),
    getAdminOrdersAction(1, 8).catch(() => ({ data: [], total: 0, page: 1, limit: 8 })),
  ]);

  const statCards = [
    {
      label: 'Ingresos totales',
      value: `$${Number(stats.revenue).toLocaleString('es-AR', { minimumFractionDigits: 0 })}`,
      icon: TrendingUp,
      bg: 'bg-[#6B1A2B]/8',
      iconColor: 'text-[#6B1A2B]',
    },
    {
      label: 'Pedidos',
      value: stats.orders.toLocaleString('es-AR'),
      icon: ShoppingBag,
      bg: 'bg-[#3B1F5E]/8',
      iconColor: 'text-[#3B1F5E]',
    },
    {
      label: 'Productos',
      value: stats.products.toLocaleString('es-AR'),
      icon: Package,
      bg: 'bg-[#A98EC5]/20',
      iconColor: 'text-[#6B1A2B]',
    },
    {
      label: 'Clientes',
      value: stats.customers.toLocaleString('es-AR'),
      icon: Users,
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-700',
    },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#3B1F5E]">Dashboard</h1>
        <p className="text-sm text-[#3B1F5E]/50 mt-0.5">
          {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-[#6B1A2B]/10 p-5 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-[#3B1F5E]/50 uppercase tracking-wide">
                {card.label}
              </p>
              <span className={`${card.bg} rounded-lg p-1.5`}>
                <card.icon className={`h-4 w-4 ${card.iconColor}`} />
              </span>
            </div>
            <p className="text-2xl font-bold text-[#3B1F5E]">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-[#6B1A2B]/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#6B1A2B]/8 flex items-center justify-between">
          <h2 className="font-semibold text-[#3B1F5E]">Pedidos recientes</h2>
          <a
            href={`/${locale}/admin/orders`}
            className="text-xs text-[#6B1A2B] hover:underline font-medium"
          >
            Ver todos →
          </a>
        </div>

        {recentOrders.data.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#3B1F5E]/40">
            No hay pedidos aún
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F9F5FB] text-[#3B1F5E]/50 text-xs uppercase tracking-wide">
                  <th className="px-6 py-3 text-left font-medium">Pedido</th>
                  <th className="px-6 py-3 text-left font-medium">Total</th>
                  <th className="px-6 py-3 text-left font-medium">Estado</th>
                  <th className="px-6 py-3 text-left font-medium">Pago</th>
                  <th className="px-6 py-3 text-left font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#6B1A2B]/6">
                {recentOrders.data.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F9F5FB] transition-colors">
                    <td className="px-6 py-3.5 font-mono text-xs text-[#6B1A2B] font-semibold">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-[#3B1F5E]">
                      ${Number(order.total).toLocaleString('es-AR')}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-[#3B1F5E]/60 text-xs">
                      {PAYMENT_LABELS[order.paymentStatus] ?? order.paymentStatus}
                    </td>
                    <td className="px-6 py-3.5 text-[#3B1F5E]/50 text-xs">
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
    </div>
  );
}
