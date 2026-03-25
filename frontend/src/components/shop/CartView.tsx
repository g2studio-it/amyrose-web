'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useCart } from '@/hooks/useCart';
import { createOrderAction } from '@/actions/orders';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CartViewProps {
  locale: string;
}

export function CartView({ locale }: CartViewProps) {
  const t = useTranslations('cart');
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();
  const router = useRouter();
  const [isOrdering, setIsOrdering] = useState(false);

  const handleRemove = (variantId: string, name: string) => {
    removeItem(variantId);
    toast.success(`${name} eliminado del carrito`);
  };

  const handleCheckout = async () => {
    setIsOrdering(true);
    try {
      const order = await createOrderAction();
      clearCart();
      router.push(`/${locale}/orders`);
      toast.success(`Pedido #${order.id.slice(0, 8)} creado con éxito`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear el pedido';
      toast.error(msg.includes('autenticado') ? 'Debés iniciar sesión para hacer un pedido' : msg);
    } finally {
      setIsOrdering(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/40" />
        <h2 className="text-xl font-semibold text-brand-burgundy">{t('empty')}</h2>
        <p className="text-muted-foreground max-w-sm">{t('emptyDescription')}</p>
        <Link
          href={`/${locale}/catalog`}
          className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-burgundy to-brand-violet text-white font-semibold hover:shadow-lg transition-all"
        >
          {t('browseCatalog')}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart items */}
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <div
            key={item.variantId}
            className="flex gap-4 p-4 rounded-2xl border border-border bg-card"
          >
            {/* Image */}
            <div className="relative h-20 w-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-3xl">🎂</div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-brand-burgundy truncate">{item.productName}</p>
              <p className="text-sm text-muted-foreground">{item.variantName}</p>
              <p className="text-sm font-semibold text-brand-violet mt-1">
                ${item.price.toLocaleString('es-AR')} c/u
              </p>
            </div>

            {/* Quantity + remove */}
            <div className="flex flex-col items-end justify-between gap-2">
              <button
                onClick={() => handleRemove(item.variantId, item.productName)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                aria-label={t('remove')}
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <div className="flex items-center rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="px-2 py-1 hover:bg-muted transition-colors disabled:opacity-30"
                  aria-label="Disminuir"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="px-3 py-1 text-sm font-bold min-w-[2rem] text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                  className="px-2 py-1 hover:bg-muted transition-colors disabled:opacity-30"
                  aria-label="Aumentar"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              <p className="text-sm font-bold text-brand-burgundy">
                ${(item.price * item.quantity).toLocaleString('es-AR')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-bold text-brand-burgundy">Resumen</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('subtotal')}</span>
              <span className="font-medium">${totalPrice.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('delivery')}</span>
              <span className="text-muted-foreground italic">A convenir</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between font-bold text-base">
              <span>{t('total')}</span>
              <span className="text-brand-burgundy">${totalPrice.toLocaleString('es-AR')}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isOrdering}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-brand-burgundy to-brand-violet text-white font-bold hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isOrdering ? 'Procesando...' : t('checkout')}
          </button>

          <Link
            href={`/${locale}/catalog`}
            className="block text-center text-sm text-muted-foreground hover:text-brand-violet transition-colors"
          >
            {t('browseCatalog')}
          </Link>
        </div>
      </div>
    </div>
  );
}
