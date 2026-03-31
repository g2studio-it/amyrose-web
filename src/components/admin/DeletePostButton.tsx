'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { deletePostAction } from '@/actions/posts';

export function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleClick = async () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    setLoading(true);
    const result = await deletePostAction(postId);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success('Noticia eliminada');
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`h-8 w-8 transition-colors ${
        confirming
          ? 'bg-red-50 text-red-600 hover:bg-red-100'
          : 'text-[#3B1F5E]/40 hover:text-red-500 hover:bg-red-50'
      }`}
      onClick={handleClick}
      disabled={loading}
      title={confirming ? 'Hacer clic para confirmar' : 'Eliminar'}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}
