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
  { label: 'Tortas',   slug: 'tortas' },
  { label: 'Cupcakes', slug: 'cupcakes' },
  { label: 'Postres',  slug: 'postres' },
] as const;

/** Pill/border-button shared style used in header */
const navBtnClass =
  'font-serif text-sm border border-nav-burgundy text-nav-purple px-3.5 py-1.5 rounded transition-all duration-150 hover:bg-nav-burgundy hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nav-burgundy focus-visible:ring-offset-2';

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
        ? 'text-nav-burgundy after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-nav-burgundy after:rounded-full'
        : 'text-nav-purple hover:text-nav-burgundy'
    }`;

  return (
    <>
      {/* ── Main header bar ───────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-nav-lilac-divider/70 shadow-[0_1px_4px_rgba(59,31,94,0.06)]">
        <div className="container mx-auto px-4 flex h-16 items-center gap-6">

          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="shrink-0 font-serif font-bold text-xl text-nav-burgundy tracking-tight hover:opacity-80 transition-opacity"
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
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 w-52 bg-white border-l-[3px] border-nav-burgundy rounded-r-xl shadow-xl overflow-hidden transition-all duration-200 ${
                  dropdownOpen
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}
                onMouseEnter={openDropdown}
                onMouseLeave={closeDropdown}
                role="menu"
              >
                <Link
                  href={`/${locale}/catalog`}
                  role="menuitem"
                  className="block px-5 py-3 font-serif text-sm font-semibold text-nav-purple hover:bg-nav-lilac-bg transition-colors duration-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  Ver todos
                </Link>
                <div className="mx-4 h-px bg-nav-lilac-divider" />
                {PRODUCT_CATEGORIES.map((item, i) => (
                  <div key={item.slug}>
                    <Link
                      href={`/${locale}/catalog?categorySlug=${item.slug}`}
                      role="menuitem"
                      className="block px-5 py-3 font-serif text-sm text-nav-burgundy hover:bg-nav-lilac-bg transition-colors duration-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      {item.label}
                    </Link>
                    {i < PRODUCT_CATEGORIES.length - 1 && (
                      <div className="mx-4 h-px bg-nav-lilac-divider" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Link href={`/${locale}/about`} className={navLinkClass('/about')}>
              Acerca de mí
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-1.5 ml-auto">

            {/* Search */}
            <button
              aria-label="Buscar"
              className="p-2 text-nav-purple hover:text-nav-burgundy transition-colors rounded-full hover:bg-nav-lilac-bg"
            >
              <Search className="h-4.5 w-4.5" />
            </button>

            {/* Cart */}
            <Link
              href={`/${locale}/cart`}
              aria-label="Carrito"
              className="relative p-2 text-nav-purple hover:text-nav-burgundy transition-colors rounded-full hover:bg-nav-lilac-bg"
            >
              <ShoppingCart className="h-4.5 w-4.5" />
              {totalItems > 0 && (
                <Badge className="absolute -right-0.5 -top-0.5 h-4.5 w-4.5 rounded-full p-0 text-[10px] flex items-center justify-center bg-nav-burgundy border-0">
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
                      className="p-2 text-nav-purple hover:text-nav-burgundy transition-colors rounded-full hover:bg-nav-lilac-bg"
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
              className="md:hidden p-2 text-nav-purple hover:text-nav-burgundy transition-colors rounded-full hover:bg-nav-lilac-bg"
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
        className={`fixed top-0 right-0 z-50 h-full w-70 bg-white shadow-2xl md:hidden flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Menú de navegación"
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-nav-lilac-divider">
          <span className="font-serif font-bold text-nav-burgundy text-lg">
            Amy Rose Bakery
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 text-nav-purple hover:text-nav-burgundy transition-colors rounded-full hover:bg-nav-lilac-bg"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Panel navigation */}
        <nav className="flex-1 overflow-y-auto">
          {/* Productos collapsible */}
          <div className="border-b border-nav-lilac-divider/60">
            <button
              className="flex w-full items-center justify-between px-5 py-3.5 font-serif text-sm text-nav-purple hover:bg-nav-lilac-bg transition-colors"
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
              <Link
                href={`/${locale}/catalog`}
                className="flex items-center gap-2 pl-8 pr-5 py-3 font-serif text-sm font-semibold text-nav-purple hover:bg-nav-lilac-bg border-l-2 border-nav-lilac-divider mx-4 mb-0.5 rounded-r-md transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Ver todos
              </Link>
              {PRODUCT_CATEGORIES.map((item) => (
                <Link
                  key={item.slug}
                  href={`/${locale}/catalog?categorySlug=${item.slug}`}
                  className="flex items-center gap-2 pl-8 pr-5 py-3 font-serif text-sm text-nav-burgundy hover:bg-nav-lilac-bg border-l-2 border-nav-burgundy mx-4 mb-0.5 rounded-r-md transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="h-2" />
            </div>
          </div>

          <Link
            href={`/${locale}/about`}
            className="flex items-center px-5 py-3.5 font-serif text-sm font-semibold tracking-wide text-nav-purple hover:bg-nav-lilac-bg border-b border-nav-lilac-divider/60 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Acerca de mí
          </Link>
        </nav>

        {/* Panel footer — auth */}
        <div className="px-5 py-4 border-t border-nav-lilac-divider">
          {session?.user ? (
            <div className="flex flex-col gap-2">
              <Link
                href={`/${locale}/orders`}
                className="flex items-center gap-2 font-serif text-sm text-nav-purple"
                onClick={() => setMobileOpen(false)}
              >
                <User className="h-4 w-4 text-nav-burgundy" />
                {session.user.name ?? session.user.email}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 font-serif text-sm text-nav-burgundy hover:text-nav-purple transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="block text-center font-serif text-sm border-2 border-nav-burgundy text-nav-purple px-4 py-2.5 rounded hover:bg-nav-burgundy hover:text-white transition-all"
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
