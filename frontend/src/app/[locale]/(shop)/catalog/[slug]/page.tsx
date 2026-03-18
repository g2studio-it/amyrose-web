import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

import { prisma } from '@/lib/prisma';
import { ImageSlider } from '@/components/shop/ImageSlider';
import { ProductDetail } from '@/components/shop/ProductDetail';
import { SuggestedProducts } from '@/components/shop/SuggestedProducts';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    select: { name: true, description: true },
  });
  if (!product) return { title: 'Producto no encontrado' };
  return {
    title: `${product.name} | Amy Rose Bakery`,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations('product');

  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      variants: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
      category: true,
    },
  });

  if (!product) notFound();

  const images = product.images.map((img) => ({
    url: img.url,
    altText: img.altText,
  }));

  const variants = product.variants.map((v) => ({
    id: v.id,
    name: v.name,
    price: Number(v.price),
    stock: v.stock,
  }));

  const primaryImage =
    product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url;

  const minPrice = Math.min(...variants.map((v) => v.price), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <div className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href={`/${locale}`} className="hover:text-brand-burgundy transition-colors flex items-center gap-1">
              <Home className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Inicio</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
            <Link href={`/${locale}/catalog`} className="hover:text-brand-burgundy transition-colors">
              Catálogo
            </Link>
            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="text-brand-burgundy font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Left: Image slider */}
          <div className="lg:sticky lg:top-24">
            <ImageSlider images={images} productName={product.name} />
          </div>

          {/* Right: Product info */}
          <div className="space-y-6">
            {/* Category pill */}
            <div>
              <Link
                href={`/${locale}/catalog`}
                className="inline-flex items-center px-3 py-1 rounded-full bg-brand-violet/10 text-brand-violet text-xs font-semibold hover:bg-brand-violet/20 transition-colors"
              >
                {product.category.name}
              </Link>
            </div>

            {/* Product name */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-burgundy leading-tight">
                {product.name}
              </h1>
              {product.isFeatured && (
                <p className="mt-1 text-xs font-semibold text-brand-violet uppercase tracking-widest">
                  ★ Producto destacado
                </p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="rounded-2xl bg-gradient-to-br from-brand-lilac-light/10 to-brand-violet/5 border border-brand-lilac-light/30 p-5">
                <h2 className="text-xs font-bold uppercase tracking-widest text-brand-violet mb-2">
                  {t('description')}
                </h2>
                <p className="text-foreground/80 leading-relaxed text-sm sm:text-base">
                  {product.description}
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-brand-burgundy/20 via-brand-violet/20 to-transparent" />

            {/* Variant selector + Add to cart */}
            <ProductDetail
              productId={product.id}
              productName={product.name}
              variants={variants}
              imageUrl={primaryImage}
            />

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: '🎨', label: 'Personalizable' },
                { icon: '🚚', label: 'Envío a domicilio' },
                { icon: '⏰', label: 'Pedido anticipado' },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted/50 text-center"
                >
                  <span className="text-xl">{icon}</span>
                  <span className="text-xs text-muted-foreground font-medium leading-tight">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Suggested products ─────────────────────────────────── */}
        <SuggestedProducts
          currentProductId={product.id}
          categoryId={product.categoryId}
          locale={locale}
        />
      </div>
    </div>
  );
}
