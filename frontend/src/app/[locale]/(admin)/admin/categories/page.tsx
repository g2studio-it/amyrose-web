import { Tag } from 'lucide-react';
import { getAdminCategoriesAction } from '@/actions/admin';

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategoriesAction().catch(() => []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-nav-purple">Categorías</h1>
        <p className="text-sm text-nav-purple/50 mt-0.5">{categories.length} categorías activas</p>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-nav-lilac-divider/50 overflow-hidden">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-nav-purple/40">
            <Tag className="h-10 w-10 opacity-30" />
            <p className="text-sm">No hay categorías registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-section-tinted text-nav-purple/50 text-xs uppercase tracking-wide">
                  <th className="px-6 py-3 text-left font-medium">Nombre</th>
                  <th className="px-6 py-3 text-left font-medium">Slug</th>
                  <th className="px-6 py-3 text-left font-medium">Descripción</th>
                  <th className="px-6 py-3 text-left font-medium">Orden</th>
                  <th className="px-6 py-3 text-left font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#6B1A2B]/6 dark:divide-dm-secondary/20">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-section-tinted transition-colors">
                    {/* Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-[#A98EC5]/20 flex items-center justify-center shrink-0">
                          <Tag className="h-3.5 w-3.5 text-nav-burgundy" />
                        </div>
                        <p className="font-medium text-nav-purple">{cat.name}</p>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="px-6 py-4">
                      <code className="text-xs bg-section-tinted text-nav-burgundy px-2 py-0.5 rounded font-mono">
                        {cat.slug}
                      </code>
                    </td>

                    {/* Description */}
                    <td className="px-6 py-4 text-nav-purple/60 text-xs max-w-64">
                      <p className="truncate">
                        {cat.description ?? <span className="text-nav-purple/30">Sin descripción</span>}
                      </p>
                    </td>

                    {/* Sort order */}
                    <td className="px-6 py-4 text-nav-purple/50 text-xs">
                      {cat.sortOrder}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          cat.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            cat.isActive ? 'bg-green-600' : 'bg-red-600'
                          }`}
                        />
                        {cat.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
