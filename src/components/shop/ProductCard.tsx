import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';

interface ProductCardProps {
  slug: string;
  name: string;
  categoryName: string;
  imageUrl?: string;
  minPrice: number;
  locale: string;
  isFeatured?: boolean;
  variantCount?: number;
}

export function ProductCard({
  slug,
  name,
  categoryName,
  imageUrl,
  minPrice,
  locale,
  isFeatured,
  variantCount = 0,
}: ProductCardProps) {
  return (
    <Link
      href={`/${locale}/catalog/${slug}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2 rounded-2xl"
    >
      <article className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-brand-lilac-light/20 to-brand-violet/10">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center">
              <span className="text-6xl mb-2">🎂</span>
            </div>
          )}

          {/* Featured badge */}
          {isFeatured && (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-gradient-to-r from-brand-burgundy to-brand-violet text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-md">
              <Star className="h-3 w-3 fill-white" />
              Destacado
            </div>
          )}

          {/* Size options badge */}
          {variantCount > 0 && (
            <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
              {variantCount} tamaño{variantCount > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 space-y-1">
          <p className="text-xs text-brand-violet font-medium uppercase tracking-wide">
            {categoryName}
          </p>
          <h3 className="font-bold text-brand-burgundy group-hover:text-brand-violet transition-colors line-clamp-2 leading-snug">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground pt-1">
            desde{' '}
            <span className="font-bold text-brand-burgundy text-base">
              ${minPrice.toLocaleString('es-AR')}
            </span>
          </p>
        </div>

        {/* Hover CTA bar */}
        <div className="px-4 pb-4">
          <div className="h-0.5 bg-gradient-to-r from-brand-burgundy to-brand-violet rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </div>
      </article>
    </Link>
  );
}
