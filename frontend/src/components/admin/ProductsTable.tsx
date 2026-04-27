'use client';

import { useState } from 'react';
import { Eye, X, Package, Tag, Star, ImageIcon } from 'lucide-react';
import { EditProductDialog } from '@/components/admin/EditProductDialog';
import { ProductDeleteButton } from '@/components/admin/ProductDeleteButton';
import type { ApiProduct, ApiCategory } from '@/lib/api';

interface Props {
  products: ApiProduct[];
  categories: ApiCategory[];
}

export function ProductsTable({ products, categories }: Props) {
  const [selected, setSelected] = useState<ApiProduct | null>(null);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground/70 dark:text-[#F5E6F0]/40">
        <Package className="h-10 w-10 opacity-30" />
        <p className="text-sm">No hay productos registrados</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Desktop / tablet table ── */}
      <div className="overflow-x-auto hidden sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted dark:bg-[#3D3845] text-muted-foreground dark:text-[#F5E6F0]/60 text-xs uppercase tracking-wide">
              <th className="px-6 py-3 text-left font-medium">Producto</th>
              <th className="px-6 py-3 text-left font-medium">Categoría</th>
              <th className="px-6 py-3 text-left font-medium">Variantes</th>
              <th className="px-6 py-3 text-left font-medium">Precio desde</th>
              <th className="px-6 py-3 text-left font-medium">Estado</th>
              <th className="px-6 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border dark:divide-dm-secondary/20">
            {products.map((product) => {
              const activeVariants = product.variants.filter((v) => v.isActive);
              const minPrice = activeVariants.length
                ? Math.min(...activeVariants.map((v) => v.price))
                : null;
              const totalStock = activeVariants.reduce((sum, v) => sum + v.stock, 0);

              return (
                <tr key={product.id} className="hover:bg-muted dark:hover:bg-[#3D3845] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.images[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="h-9 w-9 rounded-lg object-cover border border-border dark:border-dm-secondary/20 shrink-0"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-muted dark:bg-[#3D3845] flex items-center justify-center shrink-0">
                          <Package className="h-4 w-4 text-[#A98EC5] dark:text-nav-burgundy" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-nav-purple dark:text-[#F5E6F0] truncate max-w-48">{product.name}</p>
                        <p className="text-xs text-muted-foreground/70 dark:text-[#F5E6F0]/40 truncate">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground dark:text-[#F5E6F0]/70">{product.category.name}</td>
                  <td className="px-6 py-4">
                    <span className="text-muted-foreground dark:text-[#F5E6F0]/70">
                      {activeVariants.length}{' '}
                      <span className="text-muted-foreground/70 dark:text-[#F5E6F0]/40 text-xs">({totalStock} en stock)</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-nav-purple dark:text-[#F5E6F0]">
                    {minPrice !== null ? `$${Number(minPrice).toLocaleString('es-AR')}` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${product.isActive ? 'bg-green-600 dark:bg-green-400' : 'bg-red-600 dark:bg-red-400'}`} />
                        {product.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                      {product.isFeatured && (
                        <span className="rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-400">
                          Destacado
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelected(product)}
                        aria-label="Ver producto"
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground/70 dark:text-[#F5E6F0]/40 hover:bg-muted dark:hover:bg-[#3D3845] hover:text-nav-purple dark:hover:text-[#F5E6F0] transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <EditProductDialog product={product} categories={categories} />
                      <ProductDeleteButton productId={product.id} productName={product.name} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Mobile list ── */}
      <div className="sm:hidden divide-y divide-border dark:divide-dm-secondary/20">
        {products.map((product) => (
          <div key={product.id} className="flex items-center gap-3 px-4 py-3">
            {product.images[0] ? (
              <img
                src={product.images[0].url}
                alt={product.name}
                className="h-10 w-10 rounded-lg object-cover border border-border dark:border-dm-secondary/20 shrink-0"
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-muted dark:bg-[#3D3845] flex items-center justify-center shrink-0">
                <Package className="h-4 w-4 text-[#A98EC5] dark:text-nav-burgundy" />
              </div>
            )}
            <p className="font-medium text-nav-purple dark:text-[#F5E6F0] text-sm truncate flex-1">{product.name}</p>
            <div className="flex items-center gap-1 shrink-0">
              <EditProductDialog product={product} categories={categories} />
              <ProductDeleteButton productId={product.id} productName={product.name} />
            </div>
          </div>
        ))}
      </div>

      {/* ── View modal ── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative bg-card dark:bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-dm-secondary/20">
              <h2 className="font-serif font-bold text-lg text-nav-purple dark:text-[#F5E6F0]">Detalle del producto</h2>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 text-muted-foreground/70 dark:text-[#F5E6F0]/40 hover:bg-muted dark:hover:bg-[#3D3845] hover:text-nav-purple dark:hover:text-[#F5E6F0] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Image */}
              {selected.images[0] && (
                <img
                  src={selected.images.find((i) => i.isPrimary)?.url ?? selected.images[0].url}
                  alt={selected.name}
                  className="w-full h-48 object-cover rounded-xl border border-border dark:border-dm-secondary/20"
                />
              )}

              {/* Name + badges */}
              <div>
                <h3 className="font-serif font-bold text-xl text-nav-purple dark:text-[#F5E6F0]">{selected.name}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="flex items-center gap-1 rounded-full bg-muted dark:bg-[#3D3845] px-2.5 py-0.5 text-xs text-[#A98EC5] dark:text-nav-burgundy">
                    <Tag className="h-3 w-3" /> {selected.category.name}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${selected.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${selected.isActive ? 'bg-green-600 dark:bg-green-400' : 'bg-red-600 dark:bg-red-400'}`} />
                    {selected.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                  {selected.isFeatured && (
                    <span className="flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-400">
                      <Star className="h-3 w-3" /> Destacado
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {selected.description && (
                <p className="text-sm text-muted-foreground dark:text-[#F5E6F0]/60 leading-relaxed">{selected.description}</p>
              )}

              {/* Variants */}
              <div>
                <p className="text-xs uppercase tracking-widest text-[#A98EC5] dark:text-nav-burgundy font-semibold mb-2">
                  Variantes
                </p>
                <div className="space-y-2">
                  {selected.variants.map((v) => (
                    <div key={v.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${v.isActive ? 'bg-green-500 dark:bg-green-400' : 'bg-red-400'}`} />
                        <span className="text-nav-purple dark:text-[#F5E6F0]">{v.name}</span>
                        <span className="text-xs text-muted-foreground/70 dark:text-[#F5E6F0]/40">{v.stock} en stock</span>
                      </div>
                      <span className="font-semibold text-nav-purple dark:text-[#F5E6F0]">
                        ${Number(v.price).toLocaleString('es-AR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Images */}
              {selected.images.length > 1 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#A98EC5] dark:text-nav-burgundy font-semibold mb-2 flex items-center gap-1">
                    <ImageIcon className="h-3.5 w-3.5" /> Imágenes ({selected.images.length})
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {selected.images.map((img) => (
                      <img
                        key={img.id}
                        src={img.url}
                        alt={img.altText ?? selected.name}
                        className={`h-16 w-16 rounded-lg object-cover border-2 ${img.isPrimary ? 'border-brand-burgundy dark:border-dm-secondary' : 'border-border dark:border-dm-secondary/20'}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
