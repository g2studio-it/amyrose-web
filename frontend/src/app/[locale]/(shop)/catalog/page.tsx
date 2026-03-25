import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { api, type ApiProduct, type PaginatedResult } from '@/lib/api';
import { ProductCard } from '@/components/shop/ProductCard';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ categorySlug?: string }>;
}

const CATEGORY_LABELS: Record<string, string> = {
  tortas:   'Tortas',
  cupcakes: 'Cupcakes',
  postres:  'Postres',
};

export default async function CatalogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { categorySlug } = await searchParams;
  const t = await getTranslations('catalog');

  const query = categorySlug
    ? `/catalog/products?categorySlug=${categorySlug}&limit=100`
    : '/catalog/products?limit=100';

  const { data: products } = await api.get<PaginatedResult<ApiProduct>>(query);

  const activeLabel = categorySlug ? (CATEGORY_LABELS[categorySlug] ?? categorySlug) : null;

  return (
    <div className="min-h-screen bg-background">

      {/* ── Header banner ─────────────────────────────────────── */}
      <div className="bg-linear-to-br from-brand-burgundy via-brand-violet to-brand-lilac-dark text-white py-14 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            {activeLabel ?? t('title')}
          </h1>
          <p className="text-brand-lilac-light/90 text-lg">
            {activeLabel
              ? `Mostrando productos de la categoría ${activeLabel}`
              : 'Tortas artesanales hechas con amor'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">

        {/* ── Category filter tabs ───────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href={`/${locale}/catalog`}
            className={`font-serif text-sm px-4 py-1.5 rounded-full border transition-all ${
              !categorySlug
                ? 'bg-nav-burgundy text-white border-nav-burgundy'
                : 'border-nav-burgundy/40 text-nav-purple hover:border-nav-burgundy hover:text-nav-burgundy'
            }`}
          >
            Todos
          </Link>
          {Object.entries(CATEGORY_LABELS).map(([slug, label]) => (
            <Link
              key={slug}
              href={`/${locale}/catalog?categorySlug=${slug}`}
              className={`font-serif text-sm px-4 py-1.5 rounded-full border transition-all ${
                categorySlug === slug
                  ? 'bg-nav-burgundy text-white border-nav-burgundy'
                  : 'border-nav-burgundy/40 text-nav-purple hover:border-nav-burgundy hover:text-nav-burgundy'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* ── Product grid ──────────────────────────────────── */}
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <span className="text-7xl">🎂</span>
            <h2 className="text-xl font-semibold text-brand-burgundy">
              {t('noResults')}
            </h2>
            <p className="text-muted-foreground max-w-sm">
              Estamos preparando productos increíbles. ¡Volvé pronto!
            </p>
            <Link
              href={`/${locale}/catalog`}
              className="font-serif text-sm text-nav-burgundy hover:underline"
            >
              Ver todos los productos →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
        )}
      </div>
    </div>
  );
}
