import {
  getAdminProductsAction,
  getAdminCategoriesAction,
} from '@/actions/admin';
import { CreateProductDialog } from '@/components/admin/CreateProductDialog';
import { ProductsTable } from '@/components/admin/ProductsTable';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminProductsPage({
  params,
  searchParams,
}: Props) {
  const [{ locale }, { page: pageParam }] = await Promise.all([
    params,
    searchParams,
  ]);

  const page = Math.max(1, Number(pageParam ?? 1));
  const [result, categories] = await Promise.all([
    getAdminProductsAction(page, 20).catch(() => ({
      data: [],
      total: 0,
      page,
      limit: 20,
    })),
    getAdminCategoriesAction().catch(() => []),
  ]);

  const totalPages = Math.ceil(result.total / result.limit);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-nav-purple text-2xl font-bold">Productos</h1>
          <p className="text-nav-purple/50 mt-0.5 text-sm">
            {result.total} productos en total
          </p>
        </div>
        <CreateProductDialog categories={categories} />
      </div>

      {/* Table */}
      <div className="bg-card border-nav-lilac-divider/50 overflow-hidden rounded-xl border">
        {result.data.length === 0 ? (
          <div className="text-nav-purple/40 flex flex-col items-center justify-center gap-3 py-20">
            <Package className="h-10 w-10 opacity-30" />
            <p className="text-sm">No hay productos registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-section-tinted text-nav-purple/50 text-xs tracking-wide uppercase">
                  <th className="px-6 py-3 text-left font-medium">Producto</th>
                  <th className="px-6 py-3 text-left font-medium">Categoría</th>
                  <th className="px-6 py-3 text-left font-medium">Variantes</th>
                  <th className="px-6 py-3 text-left font-medium">
                    Precio desde
                  </th>
                  <th className="px-6 py-3 text-left font-medium">Estado</th>
                  <th className="px-6 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#6B1A2B]/6">
                {result.data.map((product) => {
                  const activeVariants = product.variants.filter(
                    (v) => v.isActive
                  );
                  const minPrice = activeVariants.length
                    ? Math.min(...activeVariants.map((v) => v.price))
                    : null;
                  const totalStock = activeVariants.reduce(
                    (sum, v) => sum + v.stock,
                    0
                  );

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-section-tinted transition-colors"
                    >
                      {/* Product name + image placeholder */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.images[0] ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="border-nav-lilac-divider/50 h-9 w-9 shrink-0 rounded-lg border object-cover"
                            />
                          ) : (
                            <div className="bg-section-tinted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                              <Package className="text-muted-foreground h-4 w-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-nav-purple max-w-48 truncate font-medium">
                              {product.name}
                            </p>
                            <p className="text-nav-purple/40 truncate text-xs">
                              {product.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="text-nav-purple/70 px-6 py-4">
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
                      <td className="text-nav-purple px-6 py-4 font-semibold">
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
                        <div className="flex items-center justify-end gap-1">
                          <EditProductDialog
                            product={product}
                            categories={categories}
                          />
                          <ProductDeleteButton
                            productId={product.id}
                            productName={product.name}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="text-nav-purple/50 flex items-center justify-between text-sm">
          <span>
            Mostrando {(page - 1) * result.limit + 1}–
            {Math.min(page * result.limit, result.total)} de {result.total}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/${locale}/admin/products?page=${page - 1}`}
                className="border-nav-lilac-divider/60 hover:bg-section-tinted text-nav-purple rounded-lg border px-3 py-1.5 transition-colors"
              >
                ← Anterior
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/${locale}/admin/products?page=${page + 1}`}
                className="border-nav-lilac-divider/60 hover:bg-section-tinted text-nav-purple rounded-lg border px-3 py-1.5 transition-colors"
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
