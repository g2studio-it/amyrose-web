import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getOrdersAction } from '@/actions/orders';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ payment?: string; orderId?: string }>;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  READY: 'bg-green-100 text-green-800',
  DELIVERED: 'bg-gray-100 text-gray-700',
  CANCELLED: 'bg-red-100 text-red-800',
};

const PAYMENT_BANNERS = {
  success: {
    bg: 'bg-green-50 border-green-200',
    text: 'text-green-800',
    icon: '✅',
    message: 'Tu pago con MercadoPago fue aprobado. ¡Gracias por tu compra!',
  },
  failure: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-800',
    icon: '❌',
    message: 'Hubo un problema al procesar el pago con MercadoPago. Podés intentar nuevamente o elegir otro método.',
  },
  pending: {
    bg: 'bg-yellow-50 border-yellow-200',
    text: 'text-yellow-800',
    icon: '⏳',
    message: 'Tu pago con MercadoPago está pendiente de acreditación. Te notificaremos cuando se confirme.',
  },
} as const;

export default async function OrdersPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { payment } = await searchParams;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations('orders');
  const orders = await getOrdersAction();

  const banner = payment && payment in PAYMENT_BANNERS
    ? PAYMENT_BANNERS[payment as keyof typeof PAYMENT_BANNERS]
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-extrabold text-brand-burgundy">{t('title')}</h1>

        {banner && (
          <div className={`mb-6 flex items-start gap-3 rounded-2xl border px-5 py-4 ${banner.bg}`}>
            <span className="text-xl leading-none">{banner.icon}</span>
            <p className={`text-sm font-medium ${banner.text}`}>{banner.message}</p>
          </div>
        )}

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
