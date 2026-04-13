'use client';

import { useState } from 'react';
import { Eye, X, Users, Phone, Mail, Calendar, Shield } from 'lucide-react';
import { UserToggleButton } from '@/components/admin/UserToggleButton';
import type { ApiUser } from '@/lib/api';

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Admin',
  CUSTOMER: 'Cliente',
};

const ROLE_CLASS: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-800 dark:bg-dm-primary/40 dark:text-[#F5E6F0]',
  CUSTOMER: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
};

interface Props {
  users: ApiUser[];
}

export function CustomersTable({ users }: Props) {
  const [selected, setSelected] = useState<ApiUser | null>(null);

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#3B1F5E]/40 dark:text-[#F5E6F0]/40">
        <Users className="h-10 w-10 opacity-30" />
        <p className="text-sm">No hay usuarios registrados</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Desktop / tablet table ── */}
      <div className="overflow-x-auto hidden sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F9F5FB] dark:bg-[#3D3845] text-[#3B1F5E]/50 dark:text-[#F5E6F0]/60 text-xs uppercase tracking-wide">
              <th className="px-6 py-3 text-left font-medium">Usuario</th>
              <th className="px-6 py-3 text-left font-medium">Teléfono</th>
              <th className="px-6 py-3 text-left font-medium">Rol</th>
              <th className="px-6 py-3 text-left font-medium">Estado</th>
              <th className="px-6 py-3 text-left font-medium">Registrado</th>
              <th className="px-6 py-3 text-right font-medium">Ver</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#6B1A2B]/6 dark:divide-dm-secondary/20">
            {users.map((user) => {
              const initials = (user.name ?? user.email).charAt(0).toUpperCase();
              return (
                <tr key={user.id} className="hover:bg-[#F9F5FB] dark:hover:bg-[#3D3845] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-linear-to-br from-[#6B1A2B] to-[#3B1F5E] dark:from-dm-primary dark:to-dm-secondary flex items-center justify-center text-white text-xs font-bold shrink-0 select-none">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-[#3B1F5E] dark:text-[#F5E6F0] truncate">
                          {user.name ?? <span className="text-[#3B1F5E]/40 dark:text-[#F5E6F0]/40 italic">Sin nombre</span>}
                        </p>
                        <p className="text-xs text-[#3B1F5E]/50 dark:text-[#F5E6F0]/50 truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#3B1F5E]/60 dark:text-[#F5E6F0]/60 text-xs">
                    {user.phone ?? <span className="text-[#3B1F5E]/30 dark:text-[#F5E6F0]/30">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_CLASS[user.role] ?? 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
                      {ROLE_LABEL[user.role] ?? user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <UserToggleButton userId={user.id} isActive={user.isActive} />
                  </td>
                  <td className="px-6 py-4 text-[#3B1F5E]/50 dark:text-[#F5E6F0]/50 text-xs whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString('es-AR', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelected(user)}
                      aria-label="Ver cliente"
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-[#3B1F5E]/40 dark:text-[#F5E6F0]/40 hover:bg-[#F9F5FB] dark:hover:bg-[#3D3845] hover:text-[#3B1F5E] dark:hover:text-[#F5E6F0] transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Mobile list ── */}
      <div className="sm:hidden divide-y divide-[#6B1A2B]/6 dark:divide-dm-secondary/20">
        {users.map((user) => {
          const initials = (user.name ?? user.email).charAt(0).toUpperCase();
          return (
            <div key={user.id} className="flex items-center gap-3 px-4 py-3">
              <div className="h-9 w-9 rounded-full bg-linear-to-br from-[#6B1A2B] to-[#3B1F5E] dark:from-dm-primary dark:to-dm-secondary flex items-center justify-center text-white text-sm font-bold shrink-0 select-none">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[#3B1F5E] dark:text-[#F5E6F0] text-sm truncate">
                  {user.name ?? <span className="text-[#3B1F5E]/40 dark:text-[#F5E6F0]/40 italic">Sin nombre</span>}
                </p>
                <p className="text-xs text-[#3B1F5E]/50 dark:text-[#F5E6F0]/50 truncate">{user.email}</p>
              </div>
              <button
                onClick={() => setSelected(user)}
                aria-label="Ver cliente"
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-[#3B1F5E]/40 dark:text-[#F5E6F0]/40 hover:bg-[#F9F5FB] dark:hover:bg-[#3D3845] hover:text-[#3B1F5E] dark:hover:text-[#F5E6F0] transition-colors shrink-0"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Modal ── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#6B1A2B]/10 dark:border-dm-secondary/20">
              <h2 className="font-serif font-bold text-lg text-[#3B1F5E] dark:text-[#F5E6F0]">Información del cliente</h2>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 text-[#3B1F5E]/40 dark:text-[#F5E6F0]/40 hover:bg-[#F9F5FB] dark:hover:bg-[#3D3845] hover:text-[#3B1F5E] dark:hover:text-[#F5E6F0] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-5">
              {/* Avatar + name */}
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-linear-to-br from-[#6B1A2B] to-[#3B1F5E] dark:from-dm-primary dark:to-dm-secondary flex items-center justify-center text-white text-xl font-bold shrink-0 select-none">
                  {(selected.name ?? selected.email).charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-[#3B1F5E] dark:text-[#F5E6F0] text-base">
                    {selected.name ?? <span className="text-[#3B1F5E]/40 dark:text-[#F5E6F0]/40 italic">Sin nombre</span>}
                  </p>
                  <span className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_CLASS[selected.role] ?? 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
                    {ROLE_LABEL[selected.role] ?? selected.role}
                  </span>
                </div>
              </div>

              {/* Fields */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-[#A98EC5] dark:text-nav-burgundy shrink-0" />
                  <span className="text-[#3B1F5E]/70 dark:text-[#F5E6F0]/70 break-all">{selected.email}</span>
                </div>
                {selected.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-[#A98EC5] dark:text-nav-burgundy shrink-0" />
                    <span className="text-[#3B1F5E]/70 dark:text-[#F5E6F0]/70">{selected.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-[#A98EC5] dark:text-nav-burgundy shrink-0" />
                  <span className="text-[#3B1F5E]/70 dark:text-[#F5E6F0]/70">
                    Registrado el{' '}
                    {new Date(selected.createdAt).toLocaleDateString('es-AR', {
                      day: '2-digit', month: 'long', year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-4 w-4 text-[#A98EC5] dark:text-nav-burgundy shrink-0" />
                  <span className={`font-medium ${selected.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {selected.isActive ? 'Cuenta activa' : 'Cuenta desactivada'}
                  </span>
                </div>
              </div>

              {/* ID */}
              <div className="rounded-lg bg-[#F9F5FB] dark:bg-[#3D3845] px-3 py-2">
                <p className="text-[10px] uppercase tracking-widest text-[#A98EC5] dark:text-nav-burgundy mb-0.5">ID</p>
                <p className="font-mono text-xs text-[#3B1F5E]/60 dark:text-[#F5E6F0]/60 break-all">{selected.id}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
