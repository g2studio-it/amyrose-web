import { TrendingUp, ShoppingBag, Package, Users } from 'lucide-react';
import { getDashboardStatsAction, getAdminOrdersAction } from '@/actions/admin';
import { DashboardRecentOrders } from '@/components/admin/DashboardRecentOrders';

interface Props {
  params: Promise<{ locale: string }>;
}

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
      iconColor: 'text-nav-purple',
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
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-700 dark:text-emerald-400',
    },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-nav-purple">Dashboard</h1>
        <p className="text-sm text-nav-purple/50 mt-0.5">
          {new Date().toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-card rounded-xl border border-nav-lilac-divider/50 p-5 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-nav-purple/50 uppercase tracking-wide">
                {card.label}
              </p>
              <span className={`${card.bg} rounded-lg p-1.5`}>
                <card.icon className={`h-4 w-4 ${card.iconColor}`} />
              </span>
            </div>
            <p className="text-2xl font-bold text-nav-purple">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-card rounded-xl border border-nav-lilac-divider/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-nav-purple">Pedidos recientes</h2>
          <a
            href={`/${locale}/admin/orders`}
            className="text-xs text-nav-burgundy hover:underline font-medium"
          >
            Ver todos →
          </a>
        </div>

        <DashboardRecentOrders orders={recentOrders.data} />
      </div>
    </div>
  );
}
