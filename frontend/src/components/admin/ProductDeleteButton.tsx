'use client';

import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteAdminProductAction } from '@/actions/admin';

interface ProductDeleteButtonProps {
  productId: string;
  productName: string;
}

export function ProductDeleteButton({ productId, productName }: ProductDeleteButtonProps) {
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!confirm) {
      setConfirm(true);
      // Auto-reset confirm state after 3s
      setTimeout(() => setConfirm(false), 3000);
      return;
    }

    startTransition(async () => {
      try {
        await deleteAdminProductAction(productId);
        toast.success(`"${productName}" eliminado`);
      } catch {
        toast.error('Error al eliminar el producto');
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title={confirm ? 'Confirmar eliminación' : 'Eliminar producto'}
      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all disabled:opacity-50 ${
        confirm
          ? 'bg-red-600 text-white hover:bg-red-700'
          : 'text-red-600 hover:bg-red-50'
      }`}
    >
      <Trash2 className="h-3.5 w-3.5" />
      {confirm ? 'Confirmar' : 'Eliminar'}
    </button>
  );
}
