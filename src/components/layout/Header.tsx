'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ShoppingCart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const { totalItems } = useCart();

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
          <Button asChild size="sm" variant="outline" className="hidden border-white text-white hover:bg-white hover:text-brand-burgundy md:flex">
            <Link href={`/${locale}/login`}>{t('login')}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
