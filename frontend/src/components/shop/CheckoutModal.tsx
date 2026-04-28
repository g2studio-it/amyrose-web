'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { X, CreditCard, Banknote, Wallet, Loader2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { createOrderAction } from '@/actions/orders';
import type { CartItemUI } from '@/types';

type PaymentMethod = 'mercadopago' | 'transfer' | 'cash';

interface Props {
  items: CartItemUI[];
  totalPrice: number;
  onClose: () => void;
  onSuccess: () => void; // called after order is created → clears cart
}

const METHODS: {
  id: PaymentMethod;
  icon: React.ElementType;
  label: string;
  description: string;
}[] = [
  {
    id: 'mercadopago',
    icon: CreditCard,
    label: 'MercadoPago',
    description: 'Tarjeta, débito, crédito o efectivo en puntos de pago',
  },
  {
    id: 'transfer',
    icon: Banknote,
    label: 'Transferencia bancaria',
    description: 'Transferí el monto y envianos el comprobante',
  },
  {
    id: 'cash',
    icon: Wallet,
    label: 'Efectivo',
    description: 'Abonás al momento de retirar o recibir tu pedido',
  },
];

export function CheckoutModal({ items, totalPrice, onClose, onSuccess }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleConfirm() {
    if (!paymentMethod) {
      toast.error('Seleccioná un método de pago para continuar');
      return;
    }

    setIsProcessing(true);

    const methodLabel: Record<PaymentMethod, string> = {
      mercadopago: 'MercadoPago',
      transfer: 'Transferencia bancaria',
      cash: 'Efectivo',
    };

    const fullNotes = [`Pago: ${methodLabel[paymentMethod]}`, notes.trim() || null]
      .filter(Boolean)
      .join('. ');

    try {
      const order = await createOrderAction(
        fullNotes,
        items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
      );
      onSuccess(); // clear cart

      if (paymentMethod === 'mercadopago') {
        const res = await fetch('/api/payments/create-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id, locale }),
        });
        const data = await res.json();
        if (!res.ok || !data.initPoint) {
          throw new Error(data.error ?? 'No se pudo iniciar el pago con MercadoPago');
        }
        window.location.href = data.initPoint;
        return;
      }

      onClose();

      if (paymentMethod === 'transfer') {
        toast.success(
          `Pedido #${order.id.slice(0, 8).toUpperCase()} creado. Realizá la transferencia y envianos el comprobante.`,
          { duration: 7000 },
        );
      } else {
        toast.success(
          `Pedido #${order.id.slice(0, 8).toUpperCase()} creado. Abonás en efectivo al retirar.`,
          { duration: 6000 },
        );
      }

      router.push(`/${locale}/orders`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al procesar el pedido');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isProcessing ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl max-h-[92svh]">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-brand-burgundy">Confirmar pedido</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Revisá tu pedido y elegí cómo abonar
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-gray-100 disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Order summary */}
          <div>
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Resumen
            </p>
            <div className="space-y-2 rounded-xl border border-gray-100 bg-gray-50/60 p-3.5">
              {items.map((item) => (
                <div key={item.variantId} className="flex items-center gap-2 text-sm">
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-brand-burgundy">{item.productName}</span>
                    <span className="text-muted-foreground"> — {item.variantName}</span>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-xs text-muted-foreground">
                      {item.quantity} × ${item.price.toLocaleString('es-AR')}
                    </span>
                    <span className="ml-2 font-bold text-brand-burgundy">
                      ${(item.price * item.quantity).toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              ))}
              <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2.5 font-bold text-brand-burgundy">
                <span>Total</span>
                <span className="text-lg">${totalPrice.toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              maxLength={300}
              placeholder="Ej: Sin azúcar, alérgico al maní, entregar en portería…"
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-brand-burgundy placeholder:text-muted-foreground/40 focus:border-brand-burgundy/40 focus:outline-none focus:ring-2 focus:ring-brand-burgundy/10"
            />
          </div>

          {/* Payment method */}
          <div>
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Método de pago <span className="text-brand-burgundy">*</span>
            </p>
            <div className="space-y-2">
              {METHODS.map(({ id, icon: Icon, label, description }) => {
                const selected = paymentMethod === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPaymentMethod(id)}
                    className={`flex w-full items-center gap-3.5 rounded-xl border-2 px-4 py-3.5 text-left transition-all ${
                      selected
                        ? 'border-brand-burgundy bg-brand-burgundy/5'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        selected ? 'bg-brand-burgundy text-white' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-semibold ${selected ? 'text-brand-burgundy' : 'text-gray-800'}`}
                      >
                        {label}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                    </div>

                    {/* Radio dot */}
                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        selected ? 'border-brand-burgundy bg-brand-burgundy' : 'border-gray-300'
                      }`}
                    >
                      {selected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contextual info panels */}
          {paymentMethod === 'transfer' && (
            <div className="rounded-xl border border-purple-100 bg-purple-50 p-4 text-xs text-brand-violet">
              <p className="mb-2 font-semibold">Datos para transferir:</p>
              <div className="space-y-1">
                {/* Replace with real bank details */}
                <p><span className="font-medium">CBU:</span> 0000003100022812345678</p>
                <p><span className="font-medium">Alias:</span> AMYROSE.BAKERY</p>
                <p><span className="font-medium">Titular:</span> Amy Rose Repostería</p>
              </div>
              <p className="mt-2.5 text-muted-foreground">
                Una vez realizada la transferencia, envianos el comprobante para confirmar tu pedido.
              </p>
            </div>
          )}

          {paymentMethod === 'cash' && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-xs text-amber-800">
              <p className="font-semibold">Pago en efectivo</p>
              <p className="mt-1">
                Abonás el monto total en el momento de la entrega o retiro del pedido. No se requiere
                ningún pago previo.
              </p>
            </div>
          )}

          {paymentMethod === 'mercadopago' && (
            <div className="rounded-xl border border-sky-100 bg-sky-50 p-4 text-xs text-sky-800">
              <p className="font-semibold">Pago con MercadoPago</p>
              <p className="mt-1">
                Serás redirigido a MercadoPago para completar el pago de forma segura con tarjeta,
                débito, crédito o efectivo en puntos habilitados.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-gray-100 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!paymentMethod || isProcessing}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-burgundy to-brand-violet px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando…
              </>
            ) : (
              <>
                Confirmar pedido
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
