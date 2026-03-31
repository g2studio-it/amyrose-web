import { prisma } from '@/lib/prisma';
import { getLocale } from 'next-intl/server';
import { Users, ShoppingBag, Mail, Phone, Calendar, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Role } from '@prisma/client';

function RoleBadge({ role }: { role: Role }) {
  if (role === Role.ADMIN) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#3B1F5E]/10 px-2 py-0.5 text-xs font-medium text-[#3B1F5E]">
        <Shield className="h-3 w-3" />
        Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-[#A98EC5]/15 px-2 py-0.5 text-xs font-medium text-[#6B1A2B]">
      Cliente
    </span>
  );
}

export default async function AdminCustomersPage() {
  const locale = await getLocale();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { orders: true },
      },
      orders: {
        select: { total: true },
        where: { status: { not: 'CANCELLED' } },
      },
      addresses: {
        where: { isDefault: true },
        take: 1,
      },
    },
  });

  const totalCustomers = users.filter((u) => u.role === Role.CUSTOMER).length;
  const totalAdmins = users.filter((u) => u.role === Role.ADMIN).length;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-[#3B1F5E]">Clientes</h1>
        <p className="mt-1 text-sm text-[#A98EC5]">Base de usuarios registrados</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white border border-[#6B1A2B]/10 p-4">
          <p className="text-xs text-[#A98EC5] uppercase tracking-wide">Total</p>
          <p className="mt-1 text-2xl font-bold text-[#3B1F5E]">{users.length}</p>
        </div>
        <div className="rounded-xl bg-white border border-[#6B1A2B]/10 p-4">
          <p className="text-xs text-[#A98EC5] uppercase tracking-wide">Clientes</p>
          <p className="mt-1 text-2xl font-bold text-[#3B1F5E]">{totalCustomers}</p>
        </div>
        <div className="rounded-xl bg-white border border-[#6B1A2B]/10 p-4">
          <p className="text-xs text-[#A98EC5] uppercase tracking-wide">Admins</p>
          <p className="mt-1 text-2xl font-bold text-[#3B1F5E]">{totalAdmins}</p>
        </div>
      </div>

      {/* Table */}
      {users.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#6B1A2B]/20 bg-white py-20 text-center">
          <Users className="mx-auto h-10 w-10 text-[#A98EC5]/40" />
          <p className="mt-3 text-sm font-medium text-[#3B1F5E]">No hay usuarios registrados</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#6B1A2B]/10 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#6B1A2B]/10 bg-[#F9F5FB]">
                  <th className="px-4 py-3 text-left font-semibold text-[#3B1F5E]">Usuario</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#3B1F5E]">Contacto</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#3B1F5E]">Rol</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#3B1F5E]">Pedidos</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#3B1F5E]">Total gastado</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#3B1F5E]">Dirección</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#3B1F5E]">Registrado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#6B1A2B]/5">
                {users.map((user) => {
                  const totalSpent = user.orders.reduce(
                    (sum, o) => sum + Number(o.total),
                    0
                  );
                  const defaultAddress = user.addresses[0];

                  return (
                    <tr key={user.id} className="hover:bg-[#F9F5FB]/60 transition-colors">
                      {/* Usuario */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name ?? ''}
                              className="h-8 w-8 rounded-full object-cover border border-[#6B1A2B]/20"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-[#A98EC5]/20 flex items-center justify-center text-xs font-bold text-[#3B1F5E]">
                              {(user.name ?? user.email)[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-[#3B1F5E]">
                              {user.name ?? <span className="text-[#A98EC5] italic">Sin nombre</span>}
                            </p>
                            <p className="text-xs text-[#A98EC5]">{user.id.slice(0, 8)}…</p>
                          </div>
                        </div>
                      </td>

                      {/* Contacto */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs text-[#3B1F5E]">
                            <Mail className="h-3 w-3 text-[#A98EC5]" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-[#A98EC5]">
                              <Phone className="h-3 w-3" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Rol */}
                      <td className="px-4 py-3">
                        <RoleBadge role={user.role} />
                      </td>

                      {/* Pedidos */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-[#3B1F5E]">
                          <ShoppingBag className="h-3.5 w-3.5 text-[#A98EC5]" />
                          <span className="font-medium">{user._count.orders}</span>
                        </div>
                      </td>

                      {/* Total gastado */}
                      <td className="px-4 py-3">
                        <span className="font-medium text-[#3B1F5E]">
                          {totalSpent > 0
                            ? `$${totalSpent.toLocaleString('es-AR')}`
                            : <span className="text-[#A98EC5]">—</span>}
                        </span>
                      </td>

                      {/* Dirección */}
                      <td className="px-4 py-3 max-w-[180px]">
                        {defaultAddress ? (
                          <p className="text-xs text-[#3B1F5E] truncate">
                            {defaultAddress.street} {defaultAddress.streetNumber}
                            {defaultAddress.apartment ? `, ${defaultAddress.apartment}` : ''},{' '}
                            {defaultAddress.city}
                          </p>
                        ) : (
                          <span className="text-xs text-[#A98EC5] italic">Sin dirección</span>
                        )}
                      </td>

                      {/* Fecha */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-[#A98EC5]">
                          <Calendar className="h-3 w-3" />
                          {new Date(user.createdAt).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
