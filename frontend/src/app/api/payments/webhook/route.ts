import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paymentClient } from '@/lib/mercadopago';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type === 'payment' && data?.id) {
      const payment = await paymentClient.get({ id: data.id });

      const mpPreferenceId = payment.order?.id?.toString();
      const mpPaymentId = payment.id?.toString();

      if (!mpPreferenceId) {
        return NextResponse.json({ ok: true });
      }

      const order = await prisma.order.findFirst({
        where: { mpPreferenceId },
      });

      if (!order) {
        return NextResponse.json({ ok: true });
      }

      const paymentStatusMap: Record<string, 'PENDING' | 'APPROVED' | 'REJECTED'> = {
        approved: 'APPROVED',
        rejected: 'REJECTED',
        pending: 'PENDING',
        in_process: 'PENDING',
      };

      const paymentStatus = paymentStatusMap[payment.status ?? ''] ?? 'PENDING';

      await prisma.order.update({
        where: { id: order.id },
        data: {
          mpPaymentId,
          paymentStatus,
          ...(paymentStatus === 'APPROVED' ? { status: 'CONFIRMED' } : {}),
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
