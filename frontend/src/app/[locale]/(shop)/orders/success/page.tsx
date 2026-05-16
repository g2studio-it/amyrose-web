import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { auth } from '@/auth';
import { getOrderAction } from '@/actions/orders';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ orderId?: string }>;
}

export default async function OrderSuccessPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { orderId } = await searchParams;

  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);
  if (!orderId) redirect(`/${locale}/orders`);

  const order = await getOrderAction(orderId);
  if (!order) redirect(`/${locale}/orders`);

  const paymentMethod = order.notes?.match(/^Pago: (.+?)(\n|$)/)?.[1] ?? 'No especificado';

  return (
    <div className="min-h-screen bg-background flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-lg">

        {/* Success hero */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-brand-burgundy">¡Pedido Finalizado!</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Gracias por tu compra. En breve nos ponemos en contacto.
          </p>
        </div>

        {/* Order card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">

          {/* Gradient header */}
          <div className="bg-linear-to-r from-brand-burgundy to-brand-violet px-5 py-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-[10px] text-white/60 uppercase tracking-widest">Pedido</p>
                <p className="text-lg font-bold">#{order.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/60 uppercase tracking-widest">Fecha</p>
                <p className="text-sm font-semibold">
                  {new Date(order.createdAt).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 space-y-4">
            {/* Items */}
            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-3">
                Productos
              </p>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-nav-purple dark:text-white">
                        {item.productName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.variantName} × {item.quantity} —{' '}
                        ${Number(item.unitPrice).toLocaleString('es-AR')} c/u
                      </p>
                    </div>
                    <p className="text-sm font-bold text-brand-burgundy shrink-0">
                      ${Number(item.subtotal).toLocaleString('es-AR')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-border pt-3 space-y-1.5">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>${Number(order.subtotal).toLocaleString('es-AR')}</span>
              </div>
              {Number(order.deliveryFee) > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Envío</span>
                  <span>${Number(order.deliveryFee).toLocaleString('es-AR')}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-nav-purple dark:text-white pt-1">
                <span>Total</span>
                <span className="text-brand-burgundy">
                  ${Number(order.total).toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            {/* Payment method */}
            <div className="border-t border-border pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Método de pago</span>
                <span className="font-medium text-nav-purple dark:text-white">{paymentMethod}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/${locale}/orders`}
            className="flex-1 rounded-2xl border-2 border-brand-burgundy px-5 py-3 text-center text-sm font-semibold text-brand-burgundy transition-colors hover:bg-brand-burgundy/5"
          >
            Ver mis pedidos
          </Link>
          <Link
            href={`/${locale}/catalog`}
            className="flex-1 rounded-2xl bg-linear-to-r from-brand-burgundy to-brand-violet px-5 py-3 text-center text-sm font-bold text-white shadow-sm transition-all hover:shadow-md"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
