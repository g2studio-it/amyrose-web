'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  ShoppingCart,
  LogOut,
  User,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  ClipboardList,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
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

export function Header() {
  const locale = useLocale();
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { data: session, status } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [mobileOpen, setMobileOpen]           = useState(false);
  const [productsOpen, setProductsOpen]       = useState(false);
  const [userMenuOpen, setUserMenuOpen]       = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);

  const productsRef  = useRef<HTMLDivElement>(null);
  const userMenuRef  = useRef<HTMLDivElement>(null);
  const productsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (productsRef.current && !productsRef.current.contains(e.target as Node)) {
        setProductsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const openProducts  = useCallback(() => {
    if (productsTimer.current) clearTimeout(productsTimer.current);
    setProductsOpen(true);
  }, []);
  const closeProducts = useCallback(() => {
    productsTimer.current = setTimeout(() => setProductsOpen(false), 120);
  }, []);

  const handleLogout = async () => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    await signOut({ callbackUrl: `/${locale}` });
  };

  const isActive = (path: string) => pathname.startsWith(`/${locale}${path}`);

  const navLinkClass = (path: string) =>
    `font-serif text-sm tracking-wide transition-colors duration-150 relative pb-0.5 ${
      isActive(path)
        ? 'text-nav-burgundy after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-nav-burgundy after:rounded-full'
        : 'text-nav-purple hover:text-nav-burgundy'
    }`;

  const iconBtnClass =
    'p-2 text-nav-purple dark:text-[#F5E6F0] hover:text-nav-burgundy dark:hover:text-white transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/10';

  const menuItemClass =
    'flex w-full items-center gap-2.5 px-4 py-2.5 font-serif text-sm text-nav-purple dark:text-[#F5E6F0] hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-100';

  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <>
      {/* ── Main header bar ───────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-background border-b border-nav-lilac-divider/70 dark:border-dm-secondary/30 shadow-[0_1px_4px_rgba(59,31,94,0.06)] dark:shadow-[0_1px_8px_rgba(0,0,0,0.4)] transition-colors">
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
              ref={productsRef}
              className="relative"
              onMouseEnter={openProducts}
              onMouseLeave={closeProducts}
            >
              <button
                onClick={() => setProductsOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={productsOpen}
                className={`flex items-center gap-1 ${navLinkClass('/catalog')} focus-visible:outline-none`}
              >
                Productos
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${productsOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 w-52 bg-background dark:bg-card border-l-[3px] border-nav-burgundy dark:border-dm-secondary rounded-r-xl shadow-xl overflow-hidden transition-all duration-200 ${
                  productsOpen
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}
                onMouseEnter={openProducts}
                onMouseLeave={closeProducts}
                role="menu"
              >
                <Link
                  href={`/${locale}/catalog`}
                  role="menuitem"
                  className="block px-5 py-3 font-serif text-sm font-semibold text-nav-purple dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-100"
                  onClick={() => setProductsOpen(false)}
                >
                  Ver todos
                </Link>
                <div className="mx-4 h-px bg-nav-lilac-divider" />
                {PRODUCT_CATEGORIES.map((item, i) => (
                  <div key={item.slug}>
                    <Link
                      href={`/${locale}/catalog?categorySlug=${item.slug}`}
                      role="menuitem"
                      className="block px-5 py-3 font-serif text-sm text-nav-burgundy dark:text-[#F5E6F0] hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-100"
                      onClick={() => setProductsOpen(false)}
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
          <div className="flex items-center gap-1 ml-auto">

            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                aria-label="Cambiar tema"
                className={iconBtnClass}
              >
                {resolvedTheme === 'dark'
                  ? <Sun className="h-4.5 w-4.5" />
                  : <Moon className="h-4.5 w-4.5" />
                }
              </button>
            )}

            {/* Cart */}
            <Link
              href={`/${locale}/cart`}
              aria-label="Carrito"
              className={`relative ${iconBtnClass}`}
            >
              <ShoppingCart className="h-4.5 w-4.5" />
              {totalItems > 0 && (
                <Badge className="absolute -right-0.5 -top-0.5 h-4.5 w-4.5 rounded-full p-0 text-[10px] flex items-center justify-center bg-nav-burgundy border-0">
                  {totalItems}
                </Badge>
              )}
            </Link>

            {/* User icon — desktop only */}
            {status !== 'loading' && (
              <div className="hidden md:block relative" ref={userMenuRef}>
                {session?.user ? (
                  <>
                    <button
                      onClick={() => setUserMenuOpen((v) => !v)}
                      aria-label="Mi cuenta"
                      aria-haspopup="true"
                      aria-expanded={userMenuOpen}
                      className={`${iconBtnClass} ${userMenuOpen ? 'text-nav-burgundy bg-nav-lilac-bg' : ''}`}
                    >
                      <User className="h-4.5 w-4.5" />
                    </button>

                    {/* User dropdown */}
                    <div
                      className={`absolute right-0 top-full mt-2 w-52 bg-background dark:bg-card border border-nav-lilac-divider dark:border-dm-secondary/40 rounded-xl shadow-xl overflow-hidden transition-all duration-150 ${
                        userMenuOpen
                          ? 'opacity-100 translate-y-0 pointer-events-auto'
                          : 'opacity-0 -translate-y-1 pointer-events-none'
                      }`}
                      role="menu"
                    >
                      {/* User info header */}
                      <div className="px-4 py-3 border-b border-nav-lilac-divider/60 dark:border-dm-secondary/30 bg-nav-lilac-bg/40 dark:bg-dm-primary/30">
                        <p className="font-serif text-sm font-semibold text-nav-burgundy dark:text-white truncate">
                          {session.user.name ?? 'Mi cuenta'}
                        </p>
                        <p className="text-xs text-nav-purple/60 dark:text-[#F5E6F0]/70 truncate">{session.user.email}</p>
                      </div>

                      <Link
                        href={`/${locale}/profile`}
                        role="menuitem"
                        className={menuItemClass}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4 text-nav-burgundy dark:text-[#E0B8D8]" />
                        Mi perfil
                      </Link>

                      <Link
                        href={`/${locale}/orders`}
                        role="menuitem"
                        className={menuItemClass}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <ClipboardList className="h-4 w-4 text-nav-burgundy dark:text-[#E0B8D8]" />
                        Mis pedidos
                      </Link>

                      {isAdmin && (
                        <>
                          <div className="mx-3 h-px bg-nav-lilac-divider/60 dark:bg-dm-secondary/30" />
                          <Link
                            href={`/${locale}/admin/dashboard`}
                            role="menuitem"
                            className={menuItemClass}
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <LayoutDashboard className="h-4 w-4 text-nav-burgundy dark:text-[#E0B8D8]" />
                            Dashboard
                          </Link>
                        </>
                      )}

                      <div className="mx-3 h-px bg-nav-lilac-divider/60 dark:bg-dm-secondary/30" />

                      <button
                        role="menuitem"
                        onClick={handleLogout}
                        className={`${menuItemClass} text-nav-burgundy hover:bg-red-50 dark:hover:bg-red-900/30`}
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </>
                ) : (
                  <Link
                    href={`/${locale}/login`}
                    aria-label="Iniciar sesión"
                    className={iconBtnClass}
                  >
                    <User className="h-4.5 w-4.5" />
                  </Link>
                )}
              </div>
            )}

            {/* Hamburger — mobile only */}
            <button
              className={`md:hidden ${iconBtnClass}`}
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
      <div
        className={`fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] md:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed top-0 right-0 z-50 h-full w-70 bg-background shadow-2xl md:hidden flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Menú de navegación"
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-nav-lilac-divider dark:border-dm-secondary/30 bg-background dark:bg-[#1E1B22]">
          <span className="font-serif font-bold text-nav-burgundy text-lg">Amy Rose Bakery</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 text-nav-purple hover:text-nav-burgundy transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Panel navigation */}
        <nav className="flex-1 overflow-y-auto">
          <div className="border-b border-nav-lilac-divider/60 dark:border-dm-secondary/20">
            <button
              className="flex w-full items-center justify-between px-5 py-3.5 font-serif text-sm text-nav-purple hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
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
                className="flex items-center gap-2 pl-8 pr-5 py-3 font-serif text-sm font-semibold text-nav-purple hover:bg-black/5 dark:hover:bg-white/5 border-l-2 border-nav-lilac-divider dark:border-dm-secondary/50 mx-4 mb-0.5 rounded-r-md transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Ver todos
              </Link>
              {PRODUCT_CATEGORIES.map((item) => (
                <Link
                  key={item.slug}
                  href={`/${locale}/catalog?categorySlug=${item.slug}`}
                  className="flex items-center gap-2 pl-8 pr-5 py-3 font-serif text-sm text-nav-burgundy hover:bg-black/5 dark:hover:bg-white/5 border-l-2 border-nav-burgundy dark:border-dm-secondary mx-4 mb-0.5 rounded-r-md transition-colors"
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
            className="flex items-center px-5 py-3.5 font-serif text-sm font-semibold tracking-wide text-nav-purple hover:bg-black/5 dark:hover:bg-white/5 border-b border-nav-lilac-divider/60 dark:border-dm-secondary/20 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Acerca de mí
          </Link>
        </nav>

        {/* Panel footer — auth */}
        <div className="px-5 py-4 border-t border-nav-lilac-divider dark:border-dm-secondary/30">
          {session?.user ? (
            <div className="flex flex-col gap-1">
              <div className="mb-2 pb-2 border-b border-nav-lilac-divider/60 dark:border-dm-secondary/20">
                <p className="font-serif text-sm font-semibold text-nav-burgundy truncate">
                  {session.user.name ?? 'Mi cuenta'}
                </p>
                <p className="text-xs text-nav-purple/60 truncate">{session.user.email}</p>
              </div>
              <Link
                href={`/${locale}/profile`}
                className="flex items-center gap-2.5 py-2 font-serif text-sm text-nav-purple hover:text-nav-burgundy transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <User className="h-4 w-4 text-nav-burgundy dark:text-[#E0B8D8]" />
                Mi perfil
              </Link>
              <Link
                href={`/${locale}/orders`}
                className="flex items-center gap-2.5 py-2 font-serif text-sm text-nav-purple hover:text-nav-burgundy transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <ClipboardList className="h-4 w-4 text-nav-burgundy dark:text-[#E0B8D8]" />
                Mis pedidos
              </Link>
              {isAdmin && (
                <Link
                  href={`/${locale}/admin/dashboard`}
                  className="flex items-center gap-2.5 py-2 font-serif text-sm text-nav-purple hover:text-nav-burgundy transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4 text-nav-burgundy dark:text-[#E0B8D8]" />
                  Dashboard
                </Link>
              )}
              <div className="my-1 h-px bg-nav-lilac-divider/60 dark:bg-dm-secondary/30" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 py-2 font-serif text-sm text-nav-burgundy hover:text-nav-purple transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="flex items-center justify-center gap-2 font-serif text-sm border-2 border-nav-burgundy dark:border-dm-secondary text-nav-purple px-4 py-2.5 rounded hover:bg-nav-burgundy dark:hover:bg-dm-secondary hover:text-white transition-all"
              onClick={() => setMobileOpen(false)}
            >
              <User className="h-4 w-4" />
              Ingresar
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
