'use client';

import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Ruler, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/hooks/useCart';

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface ProductDetailProps {
  productId: string;
  productName: string;
  variants: ProductVariant[];
  imageUrl?: string;
}

export function ProductDetail({
  productId,
  productName,
  variants,
  imageUrl,
}: ProductDetailProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(
    variants[0]?.id ?? ''
  );
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const isOutOfStock = !selectedVariant || selectedVariant.stock === 0;
  const maxQuantity = selectedVariant?.stock ?? 0;

  const handleVariantChange = (variantId: string) => {
    setSelectedVariantId(variantId);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!selectedVariant || isOutOfStock) return;
    addItem({
      id: `${productId}-${selectedVariant.id}`,
      productId,
      variantId: selectedVariant.id,
      productName,
      variantName: selectedVariant.name,
      price: selectedVariant.price,
      quantity,
      imageUrl,
      stock: selectedVariant.stock,
    });
    toast.success(`${productName} (${selectedVariant.name}) agregado al carrito`, {
      description: `${quantity} unidad${quantity > 1 ? 'es' : ''}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Size selector */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Ruler className="h-4 w-4 text-brand-violet" />
          <p className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Elegí tu tamaño
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {variants.map((variant) => {
            const isSelected = selectedVariantId === variant.id;
            const unavailable = variant.stock === 0;
            return (
              <button
                key={variant.id}
                onClick={() => !unavailable && handleVariantChange(variant.id)}
                disabled={unavailable}
                aria-pressed={isSelected}
                className={`relative px-7 py-3 rounded-2xl font-bold text-base transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2 ${
                  unavailable
                    ? 'opacity-40 cursor-not-allowed border-2 border-dashed border-muted-foreground text-muted-foreground'
                    : isSelected
                    ? 'text-white shadow-lg shadow-brand-burgundy/30 scale-105 bg-gradient-to-r from-brand-burgundy to-brand-violet'
                    : 'border-2 border-brand-lilac-dark/40 text-brand-burgundy hover:border-brand-violet hover:shadow-md hover:scale-102 bg-card'
                }`}
              >
                {variant.name}
                {unavailable && (
                  <span className="absolute -top-2 -right-2 bg-destructive text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                    Sin stock
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-extrabold bg-gradient-to-r from-brand-burgundy to-brand-violet bg-clip-text text-transparent">
          ${selectedVariant?.price.toLocaleString('es-AR')}
        </span>
        <span className="text-sm text-muted-foreground">por unidad</span>
      </div>

      {/* Stock indicator */}
      {selectedVariant && (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span
            className={`text-sm font-medium ${
              selectedVariant.stock > 5
                ? 'text-green-600'
                : selectedVariant.stock > 0
                ? 'text-amber-600'
                : 'text-destructive'
            }`}
          >
            {selectedVariant.stock === 0
              ? 'Sin stock disponible'
              : selectedVariant.stock <= 5
              ? `¡Solo quedan ${selectedVariant.stock} unidades!`
              : `${selectedVariant.stock} en stock`}
          </span>
        </div>
      )}

      {/* Quantity selector */}
      {!isOutOfStock && (
        <div className="flex items-center gap-4">
          <p className="text-sm font-medium text-muted-foreground">Cantidad:</p>
          <div className="flex items-center rounded-2xl border-2 border-brand-lilac-dark/30 bg-card overflow-hidden">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Disminuir cantidad"
              className="px-4 py-2.5 text-brand-burgundy hover:bg-brand-lilac-light/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-5 py-2.5 font-bold text-lg min-w-[3rem] text-center text-brand-burgundy">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
              disabled={quantity >= maxQuantity}
              aria-label="Aumentar cantidad"
              className="px-4 py-2.5 text-brand-burgundy hover:bg-brand-lilac-light/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add to cart CTA */}
      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-base tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2 ${
          isOutOfStock
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'bg-gradient-to-r from-brand-burgundy to-brand-violet text-white shadow-lg shadow-brand-burgundy/25 hover:shadow-xl hover:shadow-brand-burgundy/35 hover:scale-[1.02] active:scale-[0.98]'
        }`}
      >
        <ShoppingCart className="h-5 w-5" />
        {isOutOfStock ? 'Sin stock disponible' : 'Agregar al carrito'}
      </button>

      {/* Subtle info */}
      <p className="text-xs text-center text-muted-foreground">
        Pedido con anticipación mínima de 48 hs · Retiro en local o envío a domicilio
      </p>
    </div>
  );
}
