'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CheckoutModal } from './CheckoutModal';

interface CartViewProps {
  locale: string;
}

export function CartView({ locale }: CartViewProps) {
  const t = useTranslations('cart');
  const { data: session } = useSession();
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  const handleRemove = (variantId: string, name: string) => {
    removeItem(variantId);
    toast.success(`${name} eliminado del carrito`);
  };

  const handleCheckoutClick = () => {
    if (!session?.user) {
      toast.error('Debés iniciar sesión para realizar un pedido');
      router.push(`/${locale}/login`);
      return;
    }
    setModalOpen(true);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <ShoppingBag className="text-muted-foreground/40 h-16 w-16" />
        <h2 className="text-brand-burgundy text-xl font-semibold">
          {t('empty')}
        </h2>
        <p className="text-muted-foreground max-w-sm">
          {t('emptyDescription')}
        </p>
        <Link
          href={`/${locale}/catalog`}
          className="from-brand-burgundy to-brand-violet mt-2 inline-flex items-center gap-2 rounded-2xl bg-linear-to-r px-6 py-3 font-semibold text-white transition-all hover:shadow-lg"
        >
          {t('browseCatalog')}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Cart items */}
      <div className="space-y-4 lg:col-span-2">
        {items.map((item) => (
          <div
            key={item.variantId}
            className="border-border bg-card flex gap-4 rounded-2xl border p-4"
          >
            {/* Image */}
            <div className="bg-muted relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.productName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl">
                  🎂
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="text-brand-burgundy truncate font-bold">
                {item.productName}
              </p>
              <p className="text-muted-foreground text-sm">
                {item.variantName}
              </p>
              <p className="text-brand-violet mt-1 text-sm font-semibold">
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

              <div className="border-border flex items-center overflow-hidden rounded-xl border">
                <button
                  onClick={() =>
                    updateQuantity(item.variantId, item.quantity - 1)
                  }
                  disabled={item.quantity <= 1}
                  className="hover:bg-muted px-2 py-1 transition-colors disabled:opacity-30"
                  aria-label="Disminuir"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="min-w-[2rem] px-3 py-1 text-center text-sm font-bold">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(item.variantId, item.quantity + 1)
                  }
                  disabled={item.quantity >= item.stock}
                  className="hover:bg-muted px-2 py-1 transition-colors disabled:opacity-30"
                  aria-label="Aumentar"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              <p className="text-brand-burgundy text-sm font-bold">
                ${(item.price * item.quantity).toLocaleString('es-AR')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="lg:col-span-1">
        <div className="border-border bg-card sticky top-24 space-y-4 rounded-2xl border p-6">
          <h2 className="text-brand-burgundy text-lg font-bold">Resumen</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('subtotal')}</span>
              <span className="font-medium">
                ${totalPrice.toLocaleString('es-AR')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('delivery')}</span>
              <span className="text-muted-foreground italic">A convenir</span>
            </div>
            <div className="bg-border h-px" />
            <div className="flex justify-between text-base font-bold">
              <span>{t('total')}</span>
              <span className="text-brand-burgundy">
                ${totalPrice.toLocaleString('es-AR')}
              </span>
            </div>
          </div>

          <button
            onClick={handleCheckoutClick}
            className="from-brand-burgundy to-brand-violet w-full rounded-2xl bg-gradient-to-r py-3 font-bold text-white transition-all hover:shadow-lg"
          >
            {t('checkout')}
          </button>

          <Link
            href={`/${locale}/catalog`}
            className="text-muted-foreground hover:text-brand-violet block text-center text-sm transition-colors"
          >
            {t('browseCatalog')}
          </Link>
        </div>
      </div>
    </div>

      {modalOpen && (
        <CheckoutModal
          items={items}
          totalPrice={totalPrice}
          onClose={() => setModalOpen(false)}
          onSuccess={clearCart}
        />
      )}
    </div>
  );
}
