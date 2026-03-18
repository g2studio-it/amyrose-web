import { z } from 'zod';

export const addressSchema = z.object({
  street: z.string().min(1).max(200),
  streetNumber: z.string().min(1).max(20),
  apartment: z.string().max(50).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  postalCode: z.string().min(1).max(20),
  country: z.string().default('AR'),
  label: z.string().max(50).optional(),
  isDefault: z.boolean().default(false),
});

export const checkoutSchema = z.object({
  addressId: z.string().optional(),
  newAddress: addressSchema.optional(),
  notes: z.string().max(500).optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
