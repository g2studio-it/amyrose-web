import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getOrdersAction } from '@/actions/orders';

interface Props {
  params: Promise<{ locale: string }>;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  READY: 'bg-green-100 text-green-800',
  DELIVERED: 'bg-gray-100 text-gray-700',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default async function OrdersPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations('orders');
  const orders = await getOrdersAction();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-extrabold text-brand-burgundy">{t('title')}</h1>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <span className="text-7xl">📦</span>
            <h2 className="text-xl font-semibold text-brand-burgundy">{t('empty')}</h2>
            <Link
              href={`/${locale}/catalog`}
              className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-burgundy to-brand-violet text-white font-semibold hover:shadow-lg transition-all"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                {/* Order ID + date */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-brand-burgundy text-sm">
                    Pedido #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('date')}: {new Date(order.createdAt).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  {order.notes && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      {order.notes}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      STATUS_COLORS[order.status] ?? 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {t(`status.${order.status}` as Parameters<typeof t>[0])}
                  </span>
                </div>

                {/* Total */}
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{t('total')}</p>
                  <p className="font-bold text-brand-burgundy">
                    ${Number(order.total).toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
