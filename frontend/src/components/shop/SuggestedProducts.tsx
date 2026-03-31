import { api, type ApiProduct, type PaginatedResult } from '@/lib/api';
import { ProductCard } from './ProductCard';

interface SuggestedProductsProps {
  currentProductId: string;
  categoryId: string;
  locale: string;
}

export async function SuggestedProducts({
  currentProductId,
  categoryId,
  locale,
}: SuggestedProductsProps) {
  const { data: all } = await api.get<PaginatedResult<ApiProduct>>(
    `/catalog/products?categoryId=${categoryId}&limit=10`,
  );

  // Same category, exclude current product
  let products = all
    .filter((p) => p.id !== currentProductId)
    .slice(0, 4);

  // Fill up to 4 from other categories if needed
  if (products.length < 4) {
    const { data: others } = await api.get<PaginatedResult<ApiProduct>>(
      `/catalog/products?limit=10`,
    );
    const fill = others
      .filter((p) => p.id !== currentProductId && p.categoryId !== categoryId)
      .slice(0, 4 - products.length);
    products = [...products, ...fill];
  }

  if (products.length === 0) return null;

  return (
    <section className="mt-20 pt-12 border-t border-border">
      {/* Section header */}
      <div className="flex items-center gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-violet mb-1">
            Para seguir eligiendo
          </p>
          <h2 className="text-2xl font-bold text-brand-burgundy">
            También te puede interesar
          </h2>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-brand-burgundy/20 to-transparent hidden sm:block" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => {
          const activeVariants = product.variants.filter((v) => v.isActive);
          const minPrice = activeVariants.length
            ? Math.min(...activeVariants.map((v) => v.price))
            : 0;
          const imageUrl = product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url;
          return (
            <ProductCard
              key={product.id}
              slug={product.slug}
              name={product.name}
              categoryName={product.category.name}
              imageUrl={imageUrl}
              minPrice={minPrice}
              locale={locale}
              isFeatured={product.isFeatured}
              variantCount={activeVariants.length}
            />
          );
        })}
      </div>
    </section>
  );
}
