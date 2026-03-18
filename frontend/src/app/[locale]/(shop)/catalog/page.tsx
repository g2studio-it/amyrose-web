import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/shop/ProductCard';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function CatalogPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('catalog');

  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      variants: {
        where: { isActive: true },
        orderBy: { price: 'asc' },
      },
      category: true,
    },
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-burgundy via-brand-violet to-brand-lilac-dark text-white py-14 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">{t('title')}</h1>
          <p className="text-brand-lilac-light/90 text-lg">
            Tortas artesanales hechas con amor
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <span className="text-7xl">🎂</span>
            <h2 className="text-xl font-semibold text-brand-burgundy">
              {t('noResults')}
            </h2>
            <p className="text-muted-foreground max-w-sm">
              Estamos preparando productos increíbles. ¡Volvé pronto!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => {
              const minPrice = Math.min(
                ...product.variants.map((v) => Number(v.price))
              );
              const imageUrl = product.images[0]?.url;
              return (
                <ProductCard
                  key={product.id}
                  slug={product.slug}
                  name={product.name}
                  categoryName={product.category.name}
                  imageUrl={imageUrl}
                  minPrice={isFinite(minPrice) ? minPrice : 0}
                  locale={locale}
                  isFeatured={product.isFeatured}
                  variantCount={product.variants.length}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

