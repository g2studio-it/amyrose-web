'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff } from 'lucide-react';

import { loginSchema, type LoginInput } from '@/schemas/auth.schema';

interface LoginFormProps {
  initialError?: string;
}

export function LoginForm({ initialError }: LoginFormProps) {
  const locale = useLocale();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  useEffect(() => {
    if (initialError) {
      toast.error(initialError);
    }
  }, [initialError]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const cooldownSeconds = lockedUntil ? Math.ceil((lockedUntil - Date.now()) / 1000) : 0;
  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  const onSubmit = async (data: LoginInput) => {
    if (isLocked) {
      toast.error(`Demasiados intentos. Esperá ${cooldownSeconds}s antes de volver a intentar.`);
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!result?.ok || result?.error) {
        const next = attempts + 1;
        setAttempts(next);
        if (next >= 5) {
          setLockedUntil(Date.now() + 30_000);
        }
        toast.error('Email o contraseña incorrectos');
        return;
      }

      toast.success('¡Bienvenida!');
      router.push(`/${locale}`);
      router.refresh();
    } catch {
      toast.error('Error al iniciar sesión. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none transition focus:border-[#C9A8D9] focus:ring-2 focus:ring-[#C9A8D9]/30 autofill:bg-transparent';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-xs font-medium text-white/70 uppercase tracking-wide">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          {...register('email')}
          className={`${inputClass} ${errors.email ? 'border-red-400/60 focus:border-red-400 focus:ring-red-400/20' : ''}`}
        />
        {errors.email && (
          <p className="text-xs text-red-300">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-xs font-medium text-white/70 uppercase tracking-wide">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            {...register('password')}
            className={`${inputClass} pr-10 ${errors.password ? 'border-red-400/60 focus:border-red-400 focus:ring-red-400/20' : ''}`}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-300">{errors.password.message}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || isLocked}
        className="mt-2 w-full rounded-xl bg-[#6B1A2B] hover:bg-[#8B2438] active:scale-[0.98] text-white font-serif font-semibold py-3 text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#6B1A2B]/40"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Ingresando...
          </span>
        ) : isLocked ? (
          `Bloqueado ${cooldownSeconds}s`
        ) : (
          'Ingresar'
        )}
      </button>

      {/* Register link */}
      <p className="text-center text-xs text-white/50 pt-1">
        ¿No tenés cuenta?{' '}
        <Link
          href={`/${locale}/register`}
          className="text-[#C9A8D9] hover:text-white font-medium transition-colors"
        >
          Registrate
        </Link>
      </p>
    </form>
  );
}
