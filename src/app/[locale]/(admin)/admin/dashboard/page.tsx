export const dynamic = "force-dynamic";
import { getLocale } from "next-intl/server";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  Users,
  Newspaper,
  TrendingUp,
  ChevronRight,
  Clock,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

async function getStats() {
  const [orders, products, customers, posts, revenueResult, recentOrders] =
    await Promise.all([
      prisma.order.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.post.count({ where: { isPublished: true } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: "APPROVED" },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

  return {
    orders,
    products,
    customers,
    posts,
    revenue: Number(revenueResult._sum.total ?? 0),
    recentOrders,
  };
}

const ORDER_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  PROCESSING: "bg-purple-50 text-purple-700 border-purple-200",
  READY: "bg-green-50 text-green-700 border-green-200",
  DELIVERED: "bg-gray-50 text-gray-600 border-gray-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  PROCESSING: "En preparación",
  READY: "Listo",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export default async function AdminDashboardPage() {
  const locale = await getLocale();
  const { orders, products, customers, posts, revenue, recentOrders } =
    await getStats();

  const statCards = [
    {
      label: "Ingresos aprobados",
      value: formatPrice(revenue),
      icon: TrendingUp,
      color: "text-[#3B1F5E]",
      bg: "bg-[#F9F5FB]",
      href: null,
    },
    {
      label: "Pedidos totales",
      value: orders,
      icon: ShoppingBag,
      color: "text-[#6B1A2B]",
      bg: "bg-red-50",
      href: `/${locale}/admin/orders`,
    },
    {
      label: "Productos activos",
      value: products,
      icon: Package,
      color: "text-[#3B1F5E]",
      bg: "bg-[#F9F5FB]",
      href: `/${locale}/admin/products`,
    },
    {
      label: "Clientes registrados",
      value: customers,
      icon: Users,
      color: "text-[#6B1A2B]",
      bg: "bg-red-50",
      href: `/${locale}/admin/customers`,
    },
  ];

  const quickActions = [
    {
      label: "Nueva noticia",
      desc: "Publicar un comunicado",
      href: `/${locale}/admin/news/new`,
      icon: Newspaper,
    },
    {
      label: "Ver pedidos",
      desc: `${orders} pedidos en total`,
      href: `/${locale}/admin/orders`,
      icon: ShoppingBag,
    },
    {
      label: "Gestionar productos",
      desc: `${products} productos activos`,
      href: `/${locale}/admin/products`,
      icon: Package,
    },
    {
      label: "Ver clientes",
      desc: `${customers} clientes`,
      href: `/${locale}/admin/customers`,
      icon: Users,
    },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-[#3B1F5E]">
          Panel de Administración
        </h1>
        <p className="mt-1 text-sm text-[#A98EC5]">
          {posts} noticias publicadas
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color, bg, href }) => {
          const inner = (
            <Card className="border-[#6B1A2B]/10 bg-white shadow-none hover:border-[#6B1A2B]/30 transition-colors">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-[11px] font-medium uppercase tracking-widest text-[#A98EC5]">
                  {label}
                </CardTitle>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}
                >
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className={`font-serif text-2xl font-bold ${color}`}>
                  {value}
                </p>
              </CardContent>
            </Card>
          );

          return href ? (
            <Link key={label} href={href}>
              {inner}
            </Link>
          ) : (
            <div key={label}>{inner}</div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick actions */}
        <div className="lg:col-span-1">
          <h2 className="mb-3 font-serif text-sm font-semibold text-[#3B1F5E]">
            Acciones rápidas
          </h2>
          <div className="space-y-2">
            {quickActions.map(({ label, desc, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 rounded-xl border border-[#6B1A2B]/12 bg-white p-3.5 transition-all hover:border-[#6B1A2B]/35 hover:shadow-sm"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9F5FB] text-[#6B1A2B] transition-colors group-hover:bg-[#6B1A2B] group-hover:text-white">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#3B1F5E]">
                    {label}
                  </p>
                  <p className="truncate text-xs text-[#A98EC5]">{desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-[#A98EC5]" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-sm font-semibold text-[#3B1F5E]">
              Pedidos recientes
            </h2>
            <Link
              href={`/${locale}/admin/orders`}
              className="text-xs text-[#A98EC5] hover:text-[#6B1A2B] transition-colors"
            >
              Ver todos →
            </Link>
          </div>

          <Card className="border-[#6B1A2B]/10 bg-white shadow-none">
            {recentOrders.length === 0 ? (
              <CardContent className="py-10 text-center text-sm text-[#A98EC5]">
                No hay pedidos aún
              </CardContent>
            ) : (
              <ul className="divide-y divide-[#6B1A2B]/06">
                {recentOrders.map((order) => (
                  <li key={order.id}>
                    <Link
                      href={`/${locale}/admin/orders/${order.id}`}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#FAFAFA] transition-colors"
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#F9F5FB]">
                        <Clock className="h-3.5 w-3.5 text-[#A98EC5]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#3B1F5E]">
                          {order.user?.name ?? order.user?.email ?? "Cliente"}
                        </p>
                        <p className="text-xs text-[#A98EC5]">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-3">
                        <span className="font-serif text-sm font-semibold text-[#3B1F5E]">
                          {formatPrice(Number(order.total))}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2 py-0.5 ${ORDER_STATUS_STYLES[order.status] ?? ""}`}
                        >
                          {ORDER_STATUS_LABELS[order.status] ?? order.status}
                        </Badge>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
