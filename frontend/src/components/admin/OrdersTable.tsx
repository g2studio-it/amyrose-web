'use client';

import { useState } from 'react';
import { Eye, X, ShoppingBag, Package, CreditCard, Truck, FileText } from 'lucide-react';
import { OrderStatusSelect } from '@/components/admin/OrderStatusSelect';
import type { ApiOrder } from '@/lib/api';

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

const STATUS_LABELS: Record<string, string> = {
  PENDING:    'Pendiente',
  CONFIRMED:  'Confirmado',
  PROCESSING: 'En proceso',
  READY:      'Listo',
  DELIVERED:  'Entregado',
  CANCELLED:  'Cancelado',
};

interface Props {
  orders: ApiOrder[];
}

export function OrdersTable({ orders }: Props) {
  const [selected, setSelected] = useState<ApiOrder | null>(null);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#3B1F5E]/40 dark:text-[#F5E6F0]/40">
        <ShoppingBag className="h-10 w-10 opacity-30" />
        <p className="text-sm">No hay pedidos aún</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Desktop / tablet table ── */}
      <div className="overflow-x-auto hidden sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F9F5FB] dark:bg-[#3D3845] text-[#3B1F5E]/50 dark:text-[#F5E6F0]/60 text-xs uppercase tracking-wide">
              <th className="px-6 py-3 text-left font-medium">ID</th>
              <th className="px-6 py-3 text-left font-medium">Items</th>
              <th className="px-6 py-3 text-left font-medium">Total</th>
              <th className="px-6 py-3 text-left font-medium">Estado</th>
              <th className="px-6 py-3 text-left font-medium">Pago</th>
              <th className="px-6 py-3 text-left font-medium">Fecha</th>
              <th className="px-6 py-3 text-right font-medium">Ver</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#6B1A2B]/6 dark:divide-dm-secondary/20">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-[#F9F5FB] dark:hover:bg-[#3D3845] transition-colors">
                <td className="px-6 py-4">
                  <p className="font-mono text-xs font-semibold text-[#6B1A2B] dark:text-nav-burgundy">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-[#3B1F5E]/40 dark:text-[#F5E6F0]/40 mt-0.5 font-mono">
                    {order.userId.slice(0, 8)}…
                  </p>
                </td>
                <td className="px-6 py-4 text-[#3B1F5E]/60 dark:text-[#F5E6F0]/60 text-xs max-w-48">
                  <div className="space-y-0.5">
                    {order.items.slice(0, 2).map((item) => (
                      <p key={item.id} className="truncate">
                        {item.quantity}× {item.productName} ({item.variantName})
                      </p>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-[#3B1F5E]/40 dark:text-[#F5E6F0]/40">+{order.items.length - 2} más</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-[#3B1F5E] dark:text-[#F5E6F0]">
                    ${Number(order.total).toLocaleString('es-AR')}
                  </p>
                  {Number(order.deliveryFee) > 0 && (
                    <p className="text-xs text-[#3B1F5E]/40 dark:text-[#F5E6F0]/40 mt-0.5">
                      + ${Number(order.deliveryFee).toLocaleString('es-AR')} envío
                    </p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${PAYMENT_COLORS[order.paymentStatus] ?? 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
                    {PAYMENT_LABELS[order.paymentStatus] ?? order.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-[#3B1F5E]/50 dark:text-[#F5E6F0]/50 text-xs whitespace-nowrap">
                  {new Date(order.createdAt).toLocaleDateString('es-AR', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setSelected(order)}
                    aria-label="Ver pedido"
                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-[#3B1F5E]/40 dark:text-[#F5E6F0]/40 hover:bg-[#F9F5FB] dark:hover:bg-[#3D3845] hover:text-[#3B1F5E] dark:hover:text-[#F5E6F0] transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile list ── */}
      <div className="sm:hidden divide-y divide-[#6B1A2B]/6 dark:divide-dm-secondary/20">
        {orders.map((order) => (
          <div key={order.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-sm font-semibold text-[#6B1A2B] dark:text-nav-burgundy">
                #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-xs text-[#3B1F5E]/50 dark:text-[#F5E6F0]/50 mt-0.5">
                {order.items.length} ítem{order.items.length !== 1 ? 's' : ''} ·{' '}
                <span className="font-medium">${Number(order.total).toLocaleString('es-AR')}</span>
              </p>
            </div>
            <button
              onClick={() => setSelected(order)}
              aria-label="Ver pedido"
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-[#3B1F5E]/40 dark:text-[#F5E6F0]/40 hover:bg-[#F9F5FB] dark:hover:bg-[#3D3845] hover:text-[#3B1F5E] dark:hover:text-[#F5E6F0] transition-colors shrink-0"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* ── Modal ── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#6B1A2B]/10 dark:border-dm-secondary/20">
              <div>
                <h2 className="font-serif font-bold text-lg text-[#3B1F5E] dark:text-[#F5E6F0]">Detalle del pedido</h2>
                <p className="font-mono text-xs text-[#6B1A2B] dark:text-nav-burgundy mt-0.5">
                  #{selected.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 text-[#3B1F5E]/40 dark:text-[#F5E6F0]/40 hover:bg-[#F9F5FB] dark:hover:bg-[#3D3845] hover:text-[#3B1F5E] dark:hover:text-[#F5E6F0] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Status row */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-[#A98EC5] dark:text-nav-burgundy" />
                  <span className="text-[#3B1F5E]/60 dark:text-[#F5E6F0]/60">Estado:</span>
                  <span className="font-medium text-[#3B1F5E] dark:text-[#F5E6F0]">
                    {STATUS_LABELS[selected.status] ?? selected.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-[#A98EC5] dark:text-nav-burgundy" />
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${PAYMENT_COLORS[selected.paymentStatus] ?? 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
                    {PAYMENT_LABELS[selected.paymentStatus] ?? selected.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs uppercase tracking-widest text-[#A98EC5] dark:text-nav-burgundy font-semibold mb-2">
                  Productos
                </p>
                <div className="space-y-2">
                  {selected.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-[#3B1F5E] dark:text-[#F5E6F0] truncate">{item.productName}</p>
                        <p className="text-xs text-[#3B1F5E]/50 dark:text-[#F5E6F0]/50">{item.variantName} · ×{item.quantity}</p>
                      </div>
                      <p className="font-semibold text-[#3B1F5E] dark:text-[#F5E6F0] shrink-0">
                        ${Number(item.subtotal).toLocaleString('es-AR')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-[#6B1A2B]/10 dark:border-dm-secondary/20 pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-[#3B1F5E]/60 dark:text-[#F5E6F0]/60">
                  <span>Subtotal</span>
                  <span>${Number(selected.subtotal).toLocaleString('es-AR')}</span>
                </div>
                {Number(selected.deliveryFee) > 0 && (
                  <div className="flex items-center justify-between text-[#3B1F5E]/60 dark:text-[#F5E6F0]/60">
                    <span className="flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5" /> Envío
                    </span>
                    <span>${Number(selected.deliveryFee).toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-[#3B1F5E] dark:text-[#F5E6F0] text-base pt-1">
                  <span>Total</span>
                  <span>${Number(selected.total).toLocaleString('es-AR')}</span>
                </div>
              </div>

              {/* Notes */}
              {selected.notes && (
                <div className="flex gap-2 text-sm text-[#3B1F5E]/60 dark:text-[#F5E6F0]/60 bg-[#F9F5FB] dark:bg-[#3D3845] rounded-lg px-3 py-2">
                  <FileText className="h-4 w-4 text-[#A98EC5] dark:text-nav-burgundy shrink-0 mt-0.5" />
                  <p>{selected.notes}</p>
                </div>
              )}

              {/* Date */}
              <p className="text-xs text-[#3B1F5E]/40 dark:text-[#F5E6F0]/40">
                Creado el{' '}
                {new Date(selected.createdAt).toLocaleDateString('es-AR', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
