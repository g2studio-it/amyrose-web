'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { updateProfileSchema, type UpdateProfileInput } from '@/schemas/profile.schema';
import { updateProfileAction } from '@/actions/users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProfileFormProps {
  initialName: string;
  initialPhone: string;
}

export function ProfileForm({ initialName, initialPhone }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: initialName,
      phone: initialPhone,
    },
  });

  const onSubmit = async (data: UpdateProfileInput) => {
    setIsLoading(true);
    const result = await updateProfileAction(data);
    setIsLoading(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success('Perfil actualizado correctamente');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre completo</Label>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Tu nombre"
          {...register('name')}
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="Opcional"
          {...register('phone')}
          className={errors.phone ? 'border-destructive' : ''}
        />
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-brand-burgundy hover:bg-brand-burgundy/90"
        disabled={isLoading}
      >
        {isLoading ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </form>
  );
}
