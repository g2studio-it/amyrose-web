import { z } from 'zod';

export const productVariantSchema = z.object({
  name: z.string().min(1).max(50),
  sku: z.string().optional(),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().nonnegative(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().nonnegative().default(0),
});

export const productSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().nonnegative().default(0),
  variants: z.array(productVariantSchema).min(1),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
