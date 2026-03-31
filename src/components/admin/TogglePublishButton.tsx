'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { togglePublishAction } from '@/actions/posts';

interface Props {
  postId: string;
  isPublished: boolean;
}

export function TogglePublishButton({ postId, isPublished }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const result = await togglePublishAction(postId, !isPublished);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(isPublished ? 'Movida a borradores' : 'Publicada correctamente');
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`h-8 w-8 transition-colors ${
        isPublished
          ? 'text-green-600 hover:bg-red-50 hover:text-red-500'
          : 'text-[#A98EC5] hover:bg-green-50 hover:text-green-600'
      }`}
      onClick={handleToggle}
      disabled={loading}
      title={isPublished ? 'Despublicar' : 'Publicar'}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isPublished ? (
        <Eye className="h-3.5 w-3.5" />
      ) : (
        <EyeOff className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}
