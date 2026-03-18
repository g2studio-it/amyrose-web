import { prisma } from '@/lib/prisma';
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
  // First: same category; fill with other products if needed
  const sameCategory = await prisma.product.findMany({
    where: { isActive: true, categoryId, id: { not: currentProductId } },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      variants: { where: { isActive: true }, orderBy: { price: 'asc' }, take: 1 },
      category: true,
    },
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
    take: 4,
  });

  let products = sameCategory;

  if (products.length < 4) {
    const others = await prisma.product.findMany({
      where: {
        isActive: true,
        categoryId: { not: categoryId },
        id: { not: currentProductId },
      },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        variants: { where: { isActive: true }, orderBy: { price: 'asc' }, take: 1 },
        category: true,
      },
      orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
      take: 4 - products.length,
    });
    products = [...products, ...others];
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
          const minPrice = Number(product.variants[0]?.price ?? 0);
          const imageUrl = product.images[0]?.url;
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
              variantCount={product.variants.length}
            />
          );
        })}
      </div>
    </section>
  );
}
