'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';

import { loginSchema, type LoginInput } from '@/schemas/auth.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  const t = useTranslations('auth.login');
  const locale = useLocale();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);

    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    setIsLoading(false);

    if (!result?.ok) {
      toast.error('Email o contraseña incorrectos');
      return;
    }

    toast.success('¡Bienvenida!');
    router.push(`/${locale}`);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t('password')}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className={errors.password ? 'border-destructive' : ''}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-brand-burgundy hover:bg-brand-burgundy/90"
          disabled={isLoading}
        >
          {isLoading ? 'Ingresando...' : t('submit')}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t('noAccount')}{' '}
        <Link
          href={`/${locale}/register`}
          className="font-medium text-brand-burgundy hover:underline"
        >
          {t('register')}
        </Link>
      </p>
    </div>
  );
}
