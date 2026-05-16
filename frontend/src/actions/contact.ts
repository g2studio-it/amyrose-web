'use server';

import { prisma } from '@/lib/prisma';

export async function sendContactMessageAction(data: {
  name: string;
  email: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!data.name.trim() || !data.email.trim() || !data.message.trim()) {
    return { success: false, error: 'Todos los campos son requeridos' };
  }

  try {
    await prisma.contactMessage.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim(),
        message: data.message.trim(),
      },
    });
    return { success: true };
  } catch {
    return { success: false, error: 'Error al enviar el mensaje. Intentá de nuevo.' };
  }
}
