'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 transition-transform duration-200 md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-background">
        {/* Mobile top bar */}
        <div className="flex h-12 items-center border-b border-nav-lilac-divider/50 dark:border-dm-secondary/30 bg-background px-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
            className="rounded-lg p-1.5 text-nav-purple/60 hover:bg-black/5 dark:hover:bg-white/10 hover:text-nav-purple transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <p className="ml-3 font-serif font-semibold text-nav-purple dark:text-[#F5E6F0] text-sm">
            Amy Rose Admin
          </p>
        </div>

        {children}
      </main>
    </div>
  );
}
