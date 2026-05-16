'use client';

import { useState } from 'react';
import { Eye, X, Package, CreditCard, Truck, FileText } from 'lucide-react';
import { OrderStatusSelect } from '@/components/admin/OrderStatusSelect';
import type { ApiOrder } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  PENDING:    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  CONFIRMED:  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  PROCESSING: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  READY:      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  DELIVERED:  'bg-gray-100 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300',
  CANCELLED:  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING:    'Pendiente',
  CONFIRMED:  'Confirmado',
  PROCESSING: 'En preparación',
  READY:      'Listo',
  DELIVERED:  'Entregado',
  CANCELLED:  'Cancelado',
};

const PAYMENT_COLORS: Record<string, string> = {
  PENDING:  'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  APPROVED: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  REJECTED: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  REFUNDED: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const PAYMENT_LABELS: Record<string, string> = {
  PENDING:  'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  REFUNDED: 'Reembolsado',
};

interface Props {
  orders: ApiOrder[];
}

export function DashboardRecentOrders({ orders }: Props) {
  const [selected, setSelected] = useState<ApiOrder | null>(null);

  if (orders.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-nav-purple/40">
        No hay pedidos aún
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-border">
        {orders.map((order) => {
          const firstItem = order.items[0];
          const itemSummary = firstItem
            ? firstItem.productName + (order.items.length > 1 ? ` +${order.items.length - 1}` : '')
            : `${order.items.length} ítem${order.items.length !== 1 ? 's' : ''}`;

          return (
            <div
              key={order.id}
              className="flex items-center gap-3 px-5 py-3.5 hover:bg-section-tinted transition-colors"
            >
              {/* Code */}
              <p className="font-mono text-xs font-bold text-nav-burgundy shrink-0 w-[76px]">
                #{order.id.slice(0, 8).toUpperCase()}
              </p>

              {/* Item summary */}
              <p className="min-w-0 flex-1 text-xs text-nav-purple/70 truncate">
                {itemSummary}
              </p>

              {/* Status badge */}
              <span
                className={`shrink-0 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}
              >
                {STATUS_LABELS[order.status] ?? order.status}
              </span>

              {/* Eye button */}
              <button
                onClick={() => setSelected(order)}
                aria-label="Ver pedido"
                className="shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-lg text-nav-purple/40 hover:bg-muted hover:text-nav-burgundy transition-colors"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="font-bold text-lg text-nav-purple">Detalle del pedido</h2>
                <p className="font-mono text-xs text-nav-burgundy mt-0.5">
                  #{selected.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-nav-purple transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Status edit + payment */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-brand-lilac-dark shrink-0" />
                  <span className="text-muted-foreground">Estado:</span>
                  <OrderStatusSelect orderId={selected.id} currentStatus={selected.status} />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-brand-lilac-dark shrink-0" />
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${PAYMENT_COLORS[selected.paymentStatus] ?? 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}
                  >
                    {PAYMENT_LABELS[selected.paymentStatus] ?? selected.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs uppercase tracking-widest text-brand-lilac-dark font-semibold mb-2">
                  Productos
                </p>
                <div className="space-y-2 rounded-xl bg-muted/50 p-3">
                  {selected.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-nav-purple truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.variantName} · ×{item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-nav-purple shrink-0">
                        ${Number(item.subtotal).toLocaleString('es-AR')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-border pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${Number(selected.subtotal).toLocaleString('es-AR')}</span>
                </div>
                {Number(selected.deliveryFee) > 0 && (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5" /> Envío
                    </span>
                    <span>${Number(selected.deliveryFee).toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-nav-purple text-base pt-1">
                  <span>Total</span>
                  <span>${Number(selected.total).toLocaleString('es-AR')}</span>
                </div>
              </div>

              {/* Notes */}
              {selected.notes && (
                <div className="flex gap-2 text-sm text-muted-foreground bg-muted rounded-lg px-3 py-2">
                  <FileText className="h-4 w-4 text-brand-lilac-dark shrink-0 mt-0.5" />
                  <p>{selected.notes}</p>
                </div>
              )}

              {/* Date */}
              <p className="text-xs text-muted-foreground/70">
                Creado el{' '}
                {new Date(selected.createdAt).toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
