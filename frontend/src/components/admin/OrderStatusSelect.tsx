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
  PENDING:    'bg-yellow-50 text-yellow-800 border-yellow-200',
  CONFIRMED:  'bg-blue-50 text-blue-800 border-blue-200',
  PROCESSING: 'bg-purple-50 text-purple-800 border-purple-200',
  READY:      'bg-green-50 text-green-800 border-green-200',
  DELIVERED:  'bg-gray-50 text-gray-700 border-gray-200',
  CANCELLED:  'bg-red-50 text-red-800 border-red-200',
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
