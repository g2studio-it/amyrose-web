'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { toggleUserActiveAction } from '@/actions/admin';

interface UserToggleButtonProps {
  userId: string;
  isActive: boolean;
}

export function UserToggleButton({ userId, isActive }: UserToggleButtonProps) {
  const [active, setActive] = useState(isActive);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const next = !active;
    setActive(next);
    startTransition(async () => {
      try {
        await toggleUserActiveAction(userId, next);
        toast.success(next ? 'Usuario activado' : 'Usuario desactivado');
      } catch {
        setActive(!next);
        toast.error('Error al cambiar el estado del usuario');
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all disabled:opacity-50 ${
        active
          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-green-600' : 'bg-red-600'}`} />
      {active ? 'Activo' : 'Inactivo'}
    </button>
  );
}
