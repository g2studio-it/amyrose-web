'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAFA]">
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
      <main className="flex-1 overflow-y-auto">
        {/* Mobile top bar */}
        <div className="flex h-12 items-center border-b border-[#6B1A2B]/10 bg-white px-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
            className="rounded-lg p-1.5 text-[#3B1F5E]/60 hover:bg-[#F9F5FB] hover:text-[#3B1F5E] transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <p className="ml-3 font-serif font-semibold text-[#3B1F5E] text-sm">
            Amy Rose Admin
          </p>
        </div>

        {children}
      </main>
    </div>
  );
}
