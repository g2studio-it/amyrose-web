import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(6).max(72),
});

export const registerSchema = z
  .object({
    name: z.string().min(2).max(100),
    email: z.string().email().max(254),
    password: z.string().min(6).max(72),
    confirmPassword: z.string(),
    phone: z
      .string()
      .max(30)
      .regex(/^\+?[\d\s\-().]{7,30}$/, 'Formato de teléfono inválido')
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
