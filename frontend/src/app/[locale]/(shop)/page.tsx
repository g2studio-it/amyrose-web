import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { api, type ApiProduct, type PaginatedResult } from '@/lib/api';
import { ProductCard } from '@/components/shop/ProductCard';

interface Props {
  params: Promise<{ locale: string }>;
}

const CATEGORIES = [
  {
    slug: 'tortas',
    label: 'Tortas',
    emoji: '🎂',
    description: 'Tortas artesanales para toda ocasión. Personalizadas con amor en cada detalle.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80',
  },
  {
    slug: 'cupcakes',
    label: 'Cupcakes',
    emoji: '🧁',
    description: 'Cupcakes individuales con decorados únicos. Ideales para eventos y regalos.',
    image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=600&q=80',
  },
  {
    slug: 'postres',
    label: 'Postres',
    emoji: '🍰',
    description: 'Postres fríos y calientes de autor. Cheesecakes, tiramisú, brownies y más.',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&q=80',
  },
];

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('home');

  let allProducts: ApiProduct[] = [];
  try {
    const result = await api.get<PaginatedResult<ApiProduct>>('/catalog/products?limit=100');
    allProducts = result.data;
  } catch {
    // backend may not be running in dev
  }

  const featuredProducts = allProducts.filter((p) => p.isFeatured).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[70vh] flex items-center">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1400&q=80"
            alt="Amy Rose Bakery"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-r from-nav-purple/90 via-nav-burgundy/75 to-transparent" />
        </div>

        <div className="relative container mx-auto px-6 py-24 max-w-2xl">
          <p className="font-serif text-nav-lilac-divider text-sm uppercase tracking-[0.3em] mb-4">
            Repostería artesanal
          </p>
          <h1 className="font-serif font-extrabold text-5xl md:text-6xl text-white leading-tight mb-5">
            {t('hero.title')}
          </h1>
          <p className="text-nav-lilac-divider text-lg md:text-xl mb-10 leading-relaxed">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href={`/${locale}/catalog`}
              className="inline-flex items-center gap-2 bg-nav-burgundy hover:bg-nav-burgundy/85 text-white font-serif font-semibold px-7 py-3.5 rounded-full transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              {t('hero.cta')}
            </Link>
            <Link
              href={`/${locale}/catalog?featured=true`}
              className="inline-flex items-center gap-2 border-2 border-white/60 hover:border-white text-white font-serif font-semibold px-7 py-3.5 rounded-full transition-all duration-200 hover:bg-white/10"
            >
              Ver destacados
            </Link>
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <p className="font-serif text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
            Lo que hacemos
          </p>
          <h2 className="font-serif font-bold text-3xl text-nav-purple">
            {t('categories')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${locale}/catalog?categorySlug=${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-nav-burgundy/20 hover:border-nav-burgundy/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-nav-purple/80 via-nav-purple/30 to-transparent" />
                <span className="absolute top-4 left-4 text-3xl">{cat.emoji}</span>
                <h3 className="absolute bottom-4 left-4 font-serif font-bold text-xl text-white">
                  {cat.label}
                </h3>
              </div>
              <div className="bg-card px-5 py-4">
                <p className="text-sm text-nav-purple/70 leading-relaxed">{cat.description}</p>
                <p className="mt-3 font-serif text-xs font-semibold text-nav-burgundy uppercase tracking-wider">
                  Ver productos →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured products ─────────────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="bg-section-tinted py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="font-serif text-xs uppercase tracking-[0.25em] text-muted-foreground mb-1">
                  Selección especial
                </p>
                <h2 className="font-serif font-bold text-3xl text-nav-purple">
                  {t('featured')}
                </h2>
              </div>
              <Link
                href={`/${locale}/catalog`}
                className="hidden sm:inline-flex font-serif text-sm text-nav-burgundy hover:underline"
              >
                Ver todos →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product) => {
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
          </div>
        </section>
      )}

      {/* ── All products ──────────────────────────────────────────── */}
      {allProducts.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="font-serif text-xs uppercase tracking-[0.25em] text-muted-foreground mb-1">
                Disponible ahora
              </p>
              <h2 className="font-serif font-bold text-3xl text-nav-purple">
                Todos los productos
              </h2>
            </div>
            <Link
              href={`/${locale}/catalog`}
              className="hidden sm:inline-flex font-serif text-sm text-nav-burgundy hover:underline"
            >
              Ver catálogo completo →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
            {allProducts.map((product) => {
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

          <div className="mt-10 text-center sm:hidden">
            <Link
              href={`/${locale}/catalog`}
              className="inline-flex font-serif font-semibold text-sm border-2 border-nav-burgundy text-nav-burgundy px-6 py-2.5 rounded-full hover:bg-nav-burgundy hover:text-white transition-all"
            >
              Ver catálogo completo
            </Link>
          </div>
        </section>
      )}

      {/* ── CTA banner ────────────────────────────────────────────── */}
      <section className="bg-linear-to-r from-nav-burgundy to-nav-purple py-16 text-center text-white">
        <p className="font-serif text-xs uppercase tracking-[0.3em] text-nav-lilac-divider mb-3">
          Pedidos personalizados
        </p>
        <h2 className="font-serif font-bold text-3xl mb-4">
          ¿Tenés algo especial en mente?
        </h2>
        <p className="text-nav-lilac-divider mb-8 max-w-md mx-auto">
          Creamos tortas y postres a medida para tus celebraciones. Contactanos y lo hacemos realidad.
        </p>
        <Link
          href={`/${locale}/catalog`}
          className="inline-flex font-serif font-semibold px-8 py-3.5 rounded-full bg-background text-nav-burgundy hover:bg-nav-lilac-bg transition-colors duration-200"
        >
          Ver el catálogo
        </Link>
      </section>
    </div>
  );
}
