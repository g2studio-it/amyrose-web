import { Users } from 'lucide-react';
import { getAdminUsersAction } from '@/actions/admin';
import { UserToggleButton } from '@/components/admin/UserToggleButton';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminCustomersPage({ params, searchParams }: Props) {
  const [{ locale }, { page: pageParam }] = await Promise.all([params, searchParams]);

  const page = Math.max(1, Number(pageParam ?? 1));
  const result = await getAdminUsersAction(page, 20).catch(() => ({
    data: [],
    total: 0,
    page,
    limit: 20,
  }));

  const totalPages = Math.ceil(result.total / result.limit);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-nav-purple">Clientes</h1>
        <p className="text-sm text-nav-purple/50 mt-0.5">{result.total} usuarios registrados</p>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-nav-lilac-divider/50 overflow-hidden">
        {result.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-nav-purple/40">
            <Users className="h-10 w-10 opacity-30" />
            <p className="text-sm">No hay usuarios registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-section-tinted text-nav-purple/50 text-xs uppercase tracking-wide">
                  <th className="px-6 py-3 text-left font-medium">Usuario</th>
                  <th className="px-6 py-3 text-left font-medium">Teléfono</th>
                  <th className="px-6 py-3 text-left font-medium">Rol</th>
                  <th className="px-6 py-3 text-left font-medium">Estado</th>
                  <th className="px-6 py-3 text-left font-medium">Registrado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#6B1A2B]/6">
                {result.data.map((user) => {
                  const initials = (user.name ?? user.email)
                    .charAt(0)
                    .toUpperCase();
                  return (
                    <tr key={user.id} className="hover:bg-section-tinted transition-colors">
                      {/* User info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#6B1A2B] to-[#3B1F5E] flex items-center justify-center text-white text-xs font-bold shrink-0 select-none">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-nav-purple truncate">
                              {user.name ?? <span className="text-nav-purple/40 italic">Sin nombre</span>}
                            </p>
                            <p className="text-xs text-nav-purple/50 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4 text-nav-purple/60 text-xs">
                        {user.phone ?? <span className="text-nav-purple/30">—</span>}
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {user.role === 'ADMIN' ? 'Admin' : 'Cliente'}
                        </span>
                      </td>

                      {/* Toggle active */}
                      <td className="px-6 py-4">
                        <UserToggleButton userId={user.id} isActive={user.isActive} />
                      </td>

                      {/* Joined date */}
                      <td className="px-6 py-4 text-nav-purple/50 text-xs whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-nav-purple/50">
          <span>
            Mostrando {(page - 1) * result.limit + 1}–
            {Math.min(page * result.limit, result.total)} de {result.total}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/${locale}/admin/customers?page=${page - 1}`}
                className="px-3 py-1.5 rounded-lg border border-nav-lilac-divider/60 hover:bg-section-tinted text-nav-purple transition-colors"
              >
                ← Anterior
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/${locale}/admin/customers?page=${page + 1}`}
                className="px-3 py-1.5 rounded-lg border border-nav-lilac-divider/60 hover:bg-section-tinted text-nav-purple transition-colors"
              >
                Siguiente →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
