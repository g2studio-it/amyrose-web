import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Package } from 'lucide-react';
import { getAdminProductsAction } from '@/actions/admin';
import { ProductDeleteButton } from '@/components/admin/ProductDeleteButton';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminProductsPage({ params, searchParams }: Props) {
  const [{ locale }, { page: pageParam }] = await Promise.all([params, searchParams]);

  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect(`/${locale}/login`);
  }

  const page = Math.max(1, Number(pageParam ?? 1));
  const result = await getAdminProductsAction(page, 20).catch(() => ({
    data: [],
    total: 0,
    page,
    limit: 20,
  }));

  const totalPages = Math.ceil(result.total / result.limit);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nav-purple">Productos</h1>
          <p className="text-sm text-nav-purple/50 mt-0.5">{result.total} productos en total</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-nav-lilac-divider/50 overflow-hidden">
        {result.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-nav-purple/40">
            <Package className="h-10 w-10 opacity-30" />
            <p className="text-sm">No hay productos registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-section-tinted text-nav-purple/50 text-xs uppercase tracking-wide">
                  <th className="px-6 py-3 text-left font-medium">Producto</th>
                  <th className="px-6 py-3 text-left font-medium">Categoría</th>
                  <th className="px-6 py-3 text-left font-medium">Variantes</th>
                  <th className="px-6 py-3 text-left font-medium">Precio desde</th>
                  <th className="px-6 py-3 text-left font-medium">Estado</th>
                  <th className="px-6 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#6B1A2B]/6">
                {result.data.map((product) => {
                  const activeVariants = product.variants.filter((v) => v.isActive);
                  const minPrice = activeVariants.length
                    ? Math.min(...activeVariants.map((v) => v.price))
                    : null;
                  const totalStock = activeVariants.reduce((sum, v) => sum + v.stock, 0);

                  return (
                    <tr key={product.id} className="hover:bg-section-tinted transition-colors">
                      {/* Product name + image placeholder */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.images[0] ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="h-9 w-9 rounded-lg object-cover border border-nav-lilac-divider/50 shrink-0"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-lg bg-section-tinted flex items-center justify-center shrink-0">
                              <Package className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-nav-purple truncate max-w-48">
                              {product.name}
                            </p>
                            <p className="text-xs text-nav-purple/40 truncate">{product.slug}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 text-nav-purple/70">
                        {product.category.name}
                      </td>

                      {/* Variants */}
                      <td className="px-6 py-4">
                        <span className="text-nav-purple/70">
                          {activeVariants.length}{' '}
                          <span className="text-nav-purple/40 text-xs">
                            ({totalStock} en stock)
                          </span>
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 font-semibold text-nav-purple">
                        {minPrice !== null
                          ? `$${Number(minPrice).toLocaleString('es-AR')}`
                          : '—'}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              product.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                product.isActive ? 'bg-green-600' : 'bg-red-600'
                              }`}
                            />
                            {product.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                          {product.isFeatured && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                              Destacado
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <ProductDeleteButton productId={product.id} productName={product.name} />
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
                href={`/${locale}/admin/products?page=${page - 1}`}
                className="px-3 py-1.5 rounded-lg border border-nav-lilac-divider/60 hover:bg-section-tinted text-nav-purple transition-colors"
              >
                ← Anterior
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/${locale}/admin/products?page=${page + 1}`}
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
