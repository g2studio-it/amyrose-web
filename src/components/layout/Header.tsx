'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  ShoppingCart,
  LogOut,
  User,
  Search,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { Badge } from '@/components/ui/badge';

const PRODUCT_CATEGORIES = [
  { label: 'Panadería', slug: 'panaderia' },
  { label: 'Pastelería', slug: 'pasteleria' },
  { label: 'Salados', slug: 'salados' },
  { label: 'Bakery Lunch', slug: 'bakery-lunch' },
  { label: 'Regalá Bakery', slug: 'regala-bakery' },
] as const;

/** Pill/border-button shared style used in header */
const navBtnClass =
  'font-serif text-sm border border-[#6B1A2B] text-[#3B1F5E] px-3.5 py-1.5 rounded transition-all duration-150 hover:bg-[#6B1A2B] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B1A2B] focus-visible:ring-offset-2';

export function Header() {
  const locale = useLocale();
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { data: session, status } = useSession();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const openDropdown = useCallback(() => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setDropdownOpen(true);
  }, []);

  const closeDropdown = useCallback(() => {
    dropdownTimeoutRef.current = setTimeout(() => setDropdownOpen(false), 120);
  }, []);

  const handleLogout = async () => {
    setMobileOpen(false);
    await signOut({ callbackUrl: `/${locale}` });
  };

  const isActive = (path: string) => pathname.startsWith(`/${locale}${path}`);

  const navLinkClass = (path: string) =>
    `font-serif text-sm tracking-wide transition-colors duration-150 relative pb-0.5 ${
      isActive(path)
        ? 'text-[#6B1A2B] after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-[#6B1A2B] after:rounded-full'
        : 'text-[#3B1F5E] hover:text-[#6B1A2B]'
    }`;

  return (
    <>
      {/* ── Main header bar ───────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#D8C8E8]/70 shadow-[0_1px_4px_rgba(59,31,94,0.06)]">
        <div className="container mx-auto px-4 flex h-16 items-center gap-6">

          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="shrink-0 font-serif font-bold text-xl text-[#6B1A2B] tracking-tight hover:opacity-80 transition-opacity"
          >
            Amy Rose Bakery
          </Link>

          {/* Desktop navigation — center */}
          <nav className="hidden md:flex flex-1 items-center justify-center gap-8">

            {/* Productos with dropdown */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={openDropdown}
              onMouseLeave={closeDropdown}
            >
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                className={`flex items-center gap-1 ${navLinkClass('/catalog')} focus-visible:outline-none`}
              >
                Productos
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown panel */}
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 w-52 bg-white border-l-[3px] border-[#6B1A2B] rounded-r-xl shadow-xl overflow-hidden transition-all duration-200 ${
                  dropdownOpen
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}
                onMouseEnter={openDropdown}
                onMouseLeave={closeDropdown}
                role="menu"
              >
                {PRODUCT_CATEGORIES.map((item, i) => (
                  <div key={item.slug}>
                    <Link
                      href={`/${locale}/catalog?category=${item.slug}`}
                      role="menuitem"
                      className="block px-5 py-3 font-serif text-sm text-[#6B1A2B] hover:bg-[#F3EEF8] transition-colors duration-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      {item.label}
                    </Link>
                    {i < PRODUCT_CATEGORIES.length - 1 && (
                      <div className="mx-4 h-px bg-[#D8C8E8]" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Link href={`/${locale}/catalog`} className={navLinkClass('/novedades')}>
              Novedades
            </Link>
            <Link href={`/${locale}/about`} className={navLinkClass('/about')}>
              Acerca de mí
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-1.5 ml-auto">

            {/* Search */}
            <button
              aria-label="Buscar"
              className="p-2 text-[#3B1F5E] hover:text-[#6B1A2B] transition-colors rounded-full hover:bg-[#F3EEF8]"
            >
              <Search className="h-4.5 w-4.5" />
            </button>

            {/* Language switcher */}
            <Link
              href={`/${locale === 'es' ? 'en' : 'es'}`}
              className={navBtnClass}
            >
              {locale === 'es' ? 'EN' : 'ES'}
            </Link>

            {/* Cart */}
            <Link
              href={`/${locale}/cart`}
              aria-label="Carrito"
              className="relative p-2 text-[#3B1F5E] hover:text-[#6B1A2B] transition-colors rounded-full hover:bg-[#F3EEF8]"
            >
              <ShoppingCart className="h-4.5 w-4.5" />
              {totalItems > 0 && (
                <Badge className="absolute -right-0.5 -top-0.5 h-4.5 w-4.5 rounded-full p-0 text-[10px] flex items-center justify-center bg-[#6B1A2B] border-0">
                  {totalItems}
                </Badge>
              )}
            </Link>

            {/* Auth — desktop only */}
            {status !== 'loading' && (
              <div className="hidden md:flex items-center gap-1.5">
                {session?.user ? (
                  <>
                    <Link href={`/${locale}/orders`} className={navBtnClass}>
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        {session.user.name?.split(' ')[0] ?? 'Cuenta'}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      aria-label="Cerrar sesión"
                      className="p-2 text-[#3B1F5E] hover:text-[#6B1A2B] transition-colors rounded-full hover:bg-[#F3EEF8]"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <Link href={`/${locale}/login`} className={navBtnClass}>
                    Ingresar
                  </Link>
                )}
              </div>
            )}

            {/* Hamburger — mobile only */}
            <button
              className="md:hidden p-2 text-[#3B1F5E] hover:text-[#6B1A2B] transition-colors rounded-full hover:bg-[#F3EEF8]"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ─────────────────────────────────────── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] md:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-[280px] bg-white shadow-2xl md:hidden flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Menú de navegación"
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8C8E8]">
          <span className="font-serif font-bold text-[#6B1A2B] text-lg">
            Amy Rose Bakery
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 text-[#3B1F5E] hover:text-[#6B1A2B] transition-colors rounded-full hover:bg-[#F3EEF8]"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Panel navigation */}
        <nav className="flex-1 overflow-y-auto">
          {/* Productos collapsible */}
          <div className="border-b border-[#D8C8E8]/60">
            <button
              className="flex w-full items-center justify-between px-5 py-3.5 font-serif text-sm text-[#3B1F5E] hover:bg-[#F3EEF8] transition-colors"
              onClick={() => setMobileProductsOpen((v) => !v)}
            >
              <span className="font-semibold tracking-wide">Productos</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${mobileProductsOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ${
                mobileProductsOpen ? 'max-h-80' : 'max-h-0'
              }`}
            >
              {PRODUCT_CATEGORIES.map((item) => (
                <Link
                  key={item.slug}
                  href={`/${locale}/catalog?category=${item.slug}`}
                  className="flex items-center gap-2 pl-8 pr-5 py-3 font-serif text-sm text-[#6B1A2B] hover:bg-[#F3EEF8] border-l-2 border-[#6B1A2B] mx-4 mb-0.5 rounded-r-md transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="h-2" />
            </div>
          </div>

          <Link
            href={`/${locale}/catalog`}
            className="flex items-center px-5 py-3.5 font-serif text-sm font-semibold tracking-wide text-[#3B1F5E] hover:bg-[#F3EEF8] border-b border-[#D8C8E8]/60 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Novedades
          </Link>
          <Link
            href={`/${locale}/about`}
            className="flex items-center px-5 py-3.5 font-serif text-sm font-semibold tracking-wide text-[#3B1F5E] hover:bg-[#F3EEF8] border-b border-[#D8C8E8]/60 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Acerca de mí
          </Link>

          {/* Language */}
          <div className="px-5 py-3.5 border-b border-[#D8C8E8]/60">
            <Link
              href={`/${locale === 'es' ? 'en' : 'es'}`}
              className="inline-flex font-serif text-sm text-[#3B1F5E] border border-[#6B1A2B] px-3 py-1.5 rounded hover:bg-[#6B1A2B] hover:text-white transition-all"
              onClick={() => setMobileOpen(false)}
            >
              {locale === 'es' ? 'English' : 'Español'}
            </Link>
          </div>
        </nav>

        {/* Panel footer — auth */}
        <div className="px-5 py-4 border-t border-[#D8C8E8]">
          {session?.user ? (
            <div className="flex flex-col gap-2">
              <Link
                href={`/${locale}/orders`}
                className="flex items-center gap-2 font-serif text-sm text-[#3B1F5E]"
                onClick={() => setMobileOpen(false)}
              >
                <User className="h-4 w-4 text-[#6B1A2B]" />
                {session.user.name ?? session.user.email}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 font-serif text-sm text-[#6B1A2B] hover:text-[#3B1F5E] transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="block text-center font-serif text-sm border-2 border-[#6B1A2B] text-[#3B1F5E] px-4 py-2.5 rounded hover:bg-[#6B1A2B] hover:text-white transition-all"
              onClick={() => setMobileOpen(false)}
            >
              Ingresar
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}

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
