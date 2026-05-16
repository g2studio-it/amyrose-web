'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { updateOrderStatusAction } from '@/actions/admin';

const ORDER_STATUSES = [
  { value: 'PENDING',    label: 'Pendiente' },
  { value: 'CONFIRMED',  label: 'Confirmado' },
  { value: 'PROCESSING', label: 'En preparación' },
  { value: 'READY',      label: 'Listo' },
  { value: 'DELIVERED',  label: 'Entregado' },
  { value: 'CANCELLED',  label: 'Cancelado' },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING:    'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800/50',
  CONFIRMED:  'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50',
  PROCESSING: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/50',
  READY:      'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/50',
  DELIVERED:  'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/60 dark:text-gray-300 dark:border-gray-700/50',
  CANCELLED:  'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/50',
};

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  const handleChange = (newStatus: string) => {
    const prev = status;
    setStatus(newStatus);
    startTransition(async () => {
      try {
        await updateOrderStatusAction(orderId, newStatus);
        toast.success('Estado actualizado');
      } catch {
        setStatus(prev);
        toast.error('Error al actualizar el estado');
      }
    });
  };

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value)}
      disabled={isPending}
      className={`text-xs font-medium border rounded-full px-2.5 py-1 cursor-pointer focus:outline-none transition-opacity disabled:opacity-50 ${STATUS_COLORS[status] ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
