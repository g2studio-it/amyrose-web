export type { LoginInput, RegisterInput } from '@/schemas/auth.schema';
export type { ProductInput, ProductVariantInput } from '@/schemas/product.schema';
export type { AddressInput, CheckoutInput } from '@/schemas/checkout.schema';

export interface CartItemUI {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  stock: number;
}
