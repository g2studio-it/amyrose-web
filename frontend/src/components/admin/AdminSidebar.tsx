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
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Contenido',
    items: [
      { label: 'Noticias', href: '/news', icon: Newspaper },
    ],
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
    <aside className="flex h-screen w-56 flex-col border-r border-[#6B1A2B]/12 bg-white">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-[#6B1A2B]/10 px-4">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#6B1A2B]">
          <Store className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-serif font-bold text-[#3B1F5E] text-sm leading-tight">
            Amy Rose
          </p>
          <p className="text-[10px] uppercase tracking-widest text-[#A98EC5]">
            Admin
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="md:hidden rounded-lg p-1 text-nav-purple/50 hover:bg-[#F9F5FB] hover:text-nav-purple transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-5">
        {NAV_GROUPS.map(({ group, items }) => (
          <div key={group ?? '__root'}>
            {group && (
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A98EC5]">
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
                        ? 'bg-[#6B1A2B] text-white font-medium shadow-sm'
                        : 'text-[#3B1F5E]/65 hover:bg-[#F9F5FB] hover:text-[#3B1F5E]',
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 flex-shrink-0',
                        isActive(href) ? 'text-white' : 'text-[#A98EC5] group-hover:text-[#3B1F5E]',
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
      <div className="border-t border-[#6B1A2B]/10 px-2 py-3 space-y-0.5">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-[#3B1F5E]/50 hover:bg-[#F9F5FB] hover:text-[#3B1F5E] transition-colors"
        >
          <Store className="h-4 w-4" />
          Ver tienda
        </Link>
        <button
          onClick={() => void signOut({ callbackUrl: `/${locale}` })}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-[#6B1A2B]/60 hover:bg-red-50 hover:text-[#6B1A2B] transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
