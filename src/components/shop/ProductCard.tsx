import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  slug: string;
  name: string;
  categoryName: string;
  imageUrl?: string;
  minPrice: number;
  locale: string;
  isFeatured?: boolean;
  variantCount?: number;
  /** Percentage discount applied for cash payment (default: 10) */
  cashDiscountPct?: number;
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
  cashDiscountPct = 10,
}: ProductCardProps) {
  const cashPrice = Math.floor(minPrice * (1 - cashDiscountPct / 100));

  return (
    <Link
      href={`/${locale}/catalog/${slug}`}
      className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B1A2B] focus-visible:ring-offset-2 rounded-[12px]"
    >
      <article className="h-full flex flex-col bg-white border border-[#6B1A2B]/50 rounded-[12px] overflow-hidden transition-all duration-300 hover:shadow-[0_6px_28px_rgba(107,26,43,0.14)] hover:border-[#6B1A2B] hover:-translate-y-0.5">

        {/* ── Image — ~65% of card height ─────────────────────── */}
        <div className="relative overflow-hidden aspect-[4/3] flex-shrink-0 bg-[#F9F5FB]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <span className="text-5xl opacity-40">🎂</span>
            </div>
          )}

          {/* Featured ribbon */}
          {isFeatured && (
            <div className="absolute top-0 left-0 bg-[#6B1A2B] text-white font-serif text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-br-xl">
              Destacado
            </div>
          )}

          {/* Size count pill */}
          {variantCount > 1 && (
            <div className="absolute bottom-2.5 right-2.5 bg-white/80 backdrop-blur-sm border border-[#6B1A2B]/30 text-[#3B1F5E] font-serif text-[10px] tracking-wide px-2 py-0.5 rounded-full">
              {variantCount} tamaños
            </div>
          )}
        </div>

        {/* ── Info — ~35% of card height ──────────────────────── */}
        <div className="flex flex-col justify-between flex-1 px-4 pt-3.5 pb-4 min-h-[110px]">
          {/* Category + Name */}
          <div className="space-y-1">
            <p className="font-serif text-[10px] uppercase tracking-[0.18em] text-[#A98EC5]">
              {categoryName}
            </p>
            <h3 className="font-serif font-bold uppercase text-xs tracking-[0.08em] text-[#3B1F5E] leading-snug line-clamp-2">
              {name}
            </h3>
          </div>

          {/* Prices */}
          <div className="mt-3 space-y-0.5">
            {/* Main price */}
            <p className="font-serif font-semibold text-[1.1rem] leading-none text-[#3B1F5E]">
              ${minPrice.toLocaleString('es-AR')}
            </p>
            {/* Cash price */}
            {cashDiscountPct > 0 && (
              <p className="font-serif text-[11px] text-[#A98EC5] leading-tight">
                <span className="uppercase tracking-wide">Con efectivo </span>
                <span className="font-semibold">
                  ${cashPrice.toLocaleString('es-AR')}
                </span>
              </p>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

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
