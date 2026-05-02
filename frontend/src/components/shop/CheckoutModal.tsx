'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { X, Loader2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { createOrderAction } from '@/actions/orders';
import type { CartItemUI } from '@/types';

// MercadoPago Logo Image
const MercadoPagoIcon = () => (
  <img
    src="https://imgs.search.brave.com/2BfyDAhbS9Bn4Ix74341hFASqwiLKRsrKADxNjGXsIA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMuc2Vla2xvZ28u/Y29tL2xvZ28tcG5n/LzE5LzIvbWVyY2Fk/by1wYWdvLWxvZ28t/cG5nX3NlZWtsb2dv/LTE5ODQzMC5wbmc"
    alt="MercadoPago"
    className="h-5 w-auto"
  />
);

// Transfer Emoji Icon
const TransferIcon = () => <span className="text-lg">💸</span>;

// Cash Emoji Icon
const CashIcon = () => <span className="text-lg">💵</span>;

type PaymentMethod = 'mercadopago' | 'transfer' | 'cash';

interface Props {
  items: CartItemUI[];
  totalPrice: number;
  onClose: () => void;
  onSuccess: () => void; // called after order is created → clears cart
}

const METHODS: {
  id: PaymentMethod;
  icon: React.ElementType | typeof MercadoPagoIcon;
  label: string;
  description: string;
  disabled?: boolean;
}[] = [
  {
    id: 'cash',
    icon: CashIcon,
    label: 'Efectivo',
    description: 'Abonás al momento de retirar o recibir tu pedido',
  },
  {
    id: 'transfer',
    icon: TransferIcon,
    label: 'Transferencia bancaria',
    description: 'Transferí el monto y envianos el comprobante',
  },
  {
    id: 'mercadopago',
    icon: MercadoPagoIcon,
    label: 'MercadoPago',
    description: 'Tarjeta, débito, crédito o efectivo en puntos de pago',
    disabled: true,
  },
];

export function CheckoutModal({
  items,
  totalPrice,
  onClose,
  onSuccess,
}: Props) {
  const locale = useLocale();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null
  );
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

    const fullNotes = [
      `Pago: ${methodLabel[paymentMethod]}`,
      notes.trim() || null,
    ]
      .filter(Boolean)
      .join('. ');

    try {
      const order = await createOrderAction(
        fullNotes,
        items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        }))
      );
      onSuccess(); // clear cart
      onClose();

      if (paymentMethod === 'cash') {
        router.push(`/${locale}/orders/success?orderId=${order.id}`);
        return;
      }

      if (paymentMethod === 'transfer') {
        router.push(`/${locale}/orders/transfer?orderId=${order.id}`);
        return;
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Error al procesar el pedido'
      );
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
      <div className="bg-card relative z-10 flex max-h-[92svh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl shadow-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="border-border flex shrink-0 items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-nav-purple text-lg font-bold dark:text-white">
              Confirmar pedido
            </h2>
            <p className="text-nav-purple/60 dark:text-muted-foreground mt-0.5 text-xs">
              Revisá tu pedido y elegí cómo abonar
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-muted-foreground dark:hover:bg-dm-secondary/50 rounded-lg p-1.5 transition-colors hover:bg-gray-100 disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Order summary */}
          <div>
            <p className="text-muted-foreground mb-2.5 text-[10px] font-semibold tracking-widest uppercase">
              Resumen
            </p>
            <div className="border-border dark:bg-dm-secondary/30 space-y-2 rounded-xl border bg-gray-50/60 p-3.5">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex items-center gap-2 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-nav-purple font-semibold dark:text-white">
                      {item.productName}
                    </span>
                    <span className="text-nav-purple/60 dark:text-muted-foreground">
                      {' '}
                      — {item.variantName}
                    </span>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-nav-purple/60 dark:text-muted-foreground text-xs">
                      {item.quantity} × ${item.price.toLocaleString('es-AR')}
                    </span>
                    <span className="text-nav-purple ml-2 font-bold dark:text-white">
                      ${(item.price * item.quantity).toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              ))}
              <div className="border-border text-nav-purple mt-2 flex items-center justify-between border-t pt-2.5 font-bold dark:text-white">
                <span>Total</span>
                <span className="text-lg">
                  ${totalPrice.toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-muted-foreground mb-2 block text-[10px] font-semibold tracking-widest uppercase">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              maxLength={300}
              placeholder="Ej: Sin azúcar, alérgico al maní, entregar en portería…"
              className="border-border bg-card text-nav-purple placeholder:text-muted-foreground/50 focus:border-brand-burgundy/40 focus:ring-brand-burgundy/10 w-full resize-none rounded-xl border px-3.5 py-2.5 text-sm focus:ring-2 focus:outline-none dark:text-white"
            />
          </div>

          {/* Payment method */}
          <div>
            <p className="text-muted-foreground mb-2.5 text-[10px] font-semibold tracking-widest uppercase">
              Método de pago <span className="text-brand-burgundy">*</span>
            </p>
            <div className="space-y-2">
              {METHODS.map(({ id, icon: Icon, label, description, disabled }) => {
                const selected = paymentMethod === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => !disabled && setPaymentMethod(id)}
                    disabled={disabled}
                    className={`relative flex w-full items-center gap-3.5 rounded-xl border-2 px-4 py-3.5 text-left transition-all ${
                      disabled
                        ? 'cursor-not-allowed border-border bg-gray-50/40 opacity-50 dark:bg-dm-secondary/10'
                        : selected
                          ? 'border-brand-burgundy bg-brand-burgundy/5 dark:bg-brand-burgundy/10'
                          : 'border-border bg-gray-50 hover:border-brand-burgundy/30 dark:bg-dm-secondary/30 dark:hover:border-brand-burgundy/20'
                    }`}
                  >
                    {/* Disabled badge */}
                    {disabled && (
                      <span className="absolute top-2 right-3 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        pronto ⚙️
                      </span>
                    )}

                    {/* Icon */}
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        selected && !disabled
                          ? 'bg-brand-burgundy text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-semibold ${selected && !disabled ? 'text-brand-burgundy' : 'text-nav-purple dark:text-white'}`}
                      >
                        {label}
                      </p>
                      <p className="text-nav-purple/60 dark:text-muted-foreground mt-0.5 text-xs">
                        {description}
                      </p>
                    </div>

                    {/* Radio dot (hidden for disabled) */}
                    {!disabled && (
                      <div
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          selected
                            ? 'border-brand-burgundy bg-brand-burgundy'
                            : 'border-gray-300'
                        }`}
                      >
                        {selected && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contextual info panels */}
          {paymentMethod === 'transfer' && (
            <div className="text-brand-violet rounded-xl border border-purple-100 bg-purple-50 p-4 text-xs">
              <p className="mb-2 font-semibold">Datos para transferir:</p>
              <div className="space-y-1">
                {/* Replace with real bank details */}
                <p>
                  <span className="font-medium">CBU:</span>{' '}
                  0000003100022812345678
                </p>
                <p>
                  <span className="font-medium">Alias:</span> AMYROSE.BAKERY
                </p>
                <p>
                  <span className="font-medium">Titular:</span> Amy Rose
                  Repostería
                </p>
              </div>
              <p className="text-muted-foreground mt-2.5">
                Una vez realizada la transferencia, envianos el comprobante para
                confirmar tu pedido.
              </p>
            </div>
          )}

          {paymentMethod === 'cash' && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-xs text-amber-800">
              <p className="font-semibold">Pago en efectivo</p>
              <p className="mt-1">
                Abonás el monto total en el momento de la entrega o retiro del
                pedido. No se requiere ningún pago previo.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="border-border dark:bg-dm-secondary/30 flex shrink-0 items-center justify-end gap-3 border-t bg-gray-50/50 px-6 py-4">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-muted-foreground dark:hover:bg-dm-secondary/50 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-100 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!paymentMethod || isProcessing}
            className="from-brand-burgundy to-brand-violet inline-flex items-center gap-2 rounded-xl bg-gradient-to-r px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
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
