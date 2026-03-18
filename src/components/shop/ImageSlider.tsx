'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface SliderImage {
  url: string;
  altText: string | null;
}

interface ImageSliderProps {
  images: SliderImage[];
  productName: string;
}

export function ImageSlider({ images, productName }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const displayImages =
    images.length > 0 ? images : [{ url: '', altText: productName }];

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex(Math.max(0, Math.min(index, displayImages.length - 1)));
    },
    [displayImages.length]
  );

  const goNext = useCallback(() => {
    if (currentIndex < displayImages.length - 1) goTo(currentIndex + 1);
  }, [currentIndex, displayImages.length, goTo]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) goTo(currentIndex - 1);
  }, [currentIndex, goTo]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    // Only swipe horizontally if the gesture is more horizontal than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
      deltaX < 0 ? goNext() : goPrev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main slider */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-lilac-light/20 to-brand-violet/10 shadow-xl">
        {/* Slide track */}
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {displayImages.map((img, i) => (
            <div
              key={i}
              className="relative min-w-full aspect-square cursor-zoom-in select-none"
              onClick={() => setIsZoomed(!isZoomed)}
            >
              {img.url ? (
                <Image
                  src={img.url}
                  alt={img.altText ?? productName}
                  fill
                  className="object-cover"
                  priority={i === 0}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                /* Placeholder when no image */
                <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-lilac-light/30 via-brand-violet/10 to-brand-burgundy/10">
                  <span className="text-8xl mb-4">🎂</span>
                  <p className="text-brand-lilac-dark font-medium text-sm">
                    {productName}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Counter badge */}
        {displayImages.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
            {currentIndex + 1} / {displayImages.length}
          </div>
        )}

        {/* Zoom hint */}
        {displayImages[currentIndex]?.url && (
          <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm text-white/80 p-1.5 rounded-full">
            <ZoomIn className="h-4 w-4" />
          </div>
        )}

        {/* Navigation arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              aria-label="Imagen anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center text-brand-burgundy transition-all hover:bg-white hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goNext}
              disabled={currentIndex === displayImages.length - 1}
              aria-label="Siguiente imagen"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center text-brand-burgundy transition-all hover:bg-white hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {displayImages.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Ir a imagen ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'w-6 h-2 bg-white shadow-md'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {displayImages.map((img, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={`relative flex-shrink-0 h-16 w-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                i === currentIndex
                  ? 'border-brand-burgundy scale-105 shadow-md'
                  : 'border-transparent opacity-60 hover:opacity-90 hover:border-brand-lilac-dark'
              }`}
            >
              {img.url ? (
                <Image
                  src={img.url}
                  alt={`Miniatura ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-brand-lilac-light/40 to-brand-violet/20 flex items-center justify-center text-lg">
                  🎂
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
