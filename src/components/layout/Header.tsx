'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ShoppingCart, LogOut, User } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const { totalItems } = useCart();
  const { data: session, status } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: `/${locale}` });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-brand-burgundy/20 bg-brand-burgundy text-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href={`/${locale}`} className="text-xl font-bold tracking-tight hover:opacity-90">
          Amy Rose Bakery
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href={`/${locale}/catalog`}
            className="text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            {t('catalog')}
          </Link>
          {session?.user?.role === 'ADMIN' && (
            <Link
              href={`/${locale}/dashboard`}
              className="text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              {t('admin')}
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Locale switcher */}
          <Link
            href={`/${locale === 'es' ? 'en' : 'es'}`}
            className="text-xs font-medium text-white/70 hover:text-white uppercase"
          >
            {locale === 'es' ? 'EN' : 'ES'}
          </Link>

          {/* Cart */}
          <Link href={`/${locale}/cart`} className="relative">
            <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-white/10">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-center text-xs flex items-center justify-center bg-brand-red border-0">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Auth */}
          {status === 'loading' ? null : session?.user ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href={`/${locale}/orders`}
                className="flex items-center gap-1 text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="max-w-[120px] truncate">{session.user.name ?? session.user.email}</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-white hover:bg-white/10"
                onClick={handleLogout}
                title={t('logout')}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button asChild size="sm" variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
                <Link href={`/${locale}/register`}>{t('register')}</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="border-white text-white hover:bg-white hover:text-brand-burgundy">
                <Link href={`/${locale}/login`}>{t('login')}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
