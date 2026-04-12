'use client';

import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Newspaper,
  Package,
  Tag,
  ShoppingBag,
  Users,
  LogOut,
  ChevronRight,
  Store,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  group: string | null;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: null,
    items: [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    group: 'Contenido',
    items: [{ label: 'Noticias', href: '/news', icon: Newspaper }],
  },
  {
    group: 'Tienda',
    items: [
      { label: 'Productos', href: '/products', icon: Package },
      { label: 'Categorías', href: '/categories', icon: Tag },
      { label: 'Pedidos', href: '/orders', icon: ShoppingBag },
      { label: 'Clientes', href: '/customers', icon: Users },
    ],
  },
];

interface AdminSidebarProps {
  onClose?: () => void;
}

export function AdminSidebar({ onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const base = `/${locale}/admin`;

  const isActive = (href: string) => {
    const full = `${base}${href}`;
    return pathname === full || pathname.startsWith(`${full}/`);
  };

  return (
    <aside className="border-nav-lilac-divider/50 bg-card flex h-screen w-56 flex-col border-r">
      {/* Brand */}
      <div className="border-nav-lilac-divider/50 flex h-16 items-center gap-3 border-b px-4">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#6B1A2B]">
          <Store className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-nav-purple truncate font-serif text-sm leading-tight font-bold">
            Amy Rose
          </p>
          <p className="text-muted-foreground text-[10px] tracking-widest uppercase">
            Admin
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="text-nav-purple/50 hover:text-nav-purple rounded-lg p-1 transition-colors hover:bg-[#F9F5FB] md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-2 py-4">
        {NAV_GROUPS.map(({ group, items }) => (
          <div key={group ?? '__root'}>
            {group && (
              <p className="text-muted-foreground mb-1 px-2 text-[10px] font-semibold tracking-[0.15em] uppercase">
                {group}
              </p>
            )}
            <ul className="space-y-0.5">
              {items.map(({ label, href, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={`${base}${href}`}
                    className={cn(
                      'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-150',
                      isActive(href)
                        ? 'bg-[#6B1A2B] font-medium text-white shadow-sm'
                        : 'text-nav-purple/65 hover:bg-nav-lilac-bg hover:text-nav-purple'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 flex-shrink-0',
                        isActive(href)
                          ? 'text-white'
                          : 'text-muted-foreground group-hover:text-nav-purple'
                      )}
                    />
                    <span className="flex-1">{label}</span>
                    {isActive(href) && (
                      <ChevronRight className="h-3 w-3 opacity-50" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer — back to store + logout */}
      <div className="border-nav-lilac-divider/50 space-y-0.5 border-t px-2 py-3">
        <Link
          href={`/${locale}`}
          className="text-nav-purple/50 hover:bg-nav-lilac-bg hover:text-nav-purple flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors"
        >
          <Store className="h-4 w-4" />
          Ver tienda
        </Link>
        <button
          onClick={() => void signOut({ callbackUrl: `/${locale}` })}
          className="text-nav-burgundy/60 hover:text-nav-burgundy flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
