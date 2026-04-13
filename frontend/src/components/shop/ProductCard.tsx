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
      <article className="h-full flex flex-col bg-card border border-[#6B1A2B]/50 dark:border-dm-secondary/40 rounded-[12px] overflow-hidden transition-all duration-300 hover:shadow-[0_6px_28px_rgba(107,26,43,0.14)] dark:hover:shadow-[0_6px_28px_rgba(127,82,129,0.25)] hover:border-[#6B1A2B] dark:hover:border-dm-secondary hover:-translate-y-0.5">

        {/* ── Image — ~65% of card height ─────────────────────── */}
        <div className="relative overflow-hidden aspect-[4/3] flex-shrink-0 bg-section-tinted">
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
            <div className="absolute top-0 left-0 bg-[#6B1A2B] dark:bg-dm-primary text-white font-serif text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-br-xl">
              Destacado
            </div>
          )}

          {/* Size count pill */}
          {variantCount > 1 && (
            <div className="absolute bottom-2.5 right-2.5 bg-background/80 backdrop-blur-sm border border-[#6B1A2B]/30 dark:border-dm-secondary/40 text-nav-purple font-serif text-[10px] tracking-wide px-2 py-0.5 rounded-full">
              {variantCount} tamaños
            </div>
          )}
        </div>

        {/* ── Info — ~35% of card height ──────────────────────── */}
        <div className="flex flex-col justify-between flex-1 px-4 pt-3.5 pb-4 min-h-[110px]">
          {/* Category + Name */}
          <div className="space-y-1">
            <p className="font-serif text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {categoryName}
            </p>
            <h3 className="font-serif font-bold uppercase text-xs tracking-[0.08em] text-nav-purple leading-snug line-clamp-2">
              {name}
            </h3>
          </div>

          {/* Prices */}
          <div className="mt-3 space-y-0.5">
            {/* Main price */}
            <p className="font-serif font-semibold text-[1.1rem] leading-none text-nav-purple">
              ${minPrice.toLocaleString('es-AR')}
            </p>
            {/* Cash price */}
            {cashDiscountPct > 0 && (
              <p className="font-serif text-[11px] text-muted-foreground leading-tight">
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
