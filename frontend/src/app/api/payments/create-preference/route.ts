import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { preferenceClient } from '@/lib/mercadopago';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, locale = 'es' } = await req.json();

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: session.user.id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
    const ordersUrl = `${appUrl}/${locale}/orders`;
    const isLocalhost = appUrl.includes('localhost') || appUrl.includes('127.0.0.1');

    const preference = await preferenceClient.create({
      body: {
        items: order.items.map((item: { variantId: string; productName: string; variantName: string; quantity: number; unitPrice: number | { toNumber(): number } }) => ({
          id: item.variantId,
          title: `${item.productName} — ${item.variantName}`,
          quantity: item.quantity,
          unit_price: Number(item.unitPrice),
          currency_id: 'ARS',
        })),
        back_urls: {
          success: `${ordersUrl}?payment=success&orderId=${orderId}`,
          failure: `${ordersUrl}?payment=failure&orderId=${orderId}`,
          pending: `${ordersUrl}?payment=pending&orderId=${orderId}`,
        },
        ...(isLocalhost ? {} : { auto_return: 'approved' }),
        external_reference: orderId,
        ...(!isLocalhost ? { notification_url: `${appUrl}/api/payments/webhook` } : {}),
      },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { mpPreferenceId: preference.id },
    });

    return NextResponse.json({ preferenceId: preference.id, initPoint: preference.init_point });
  } catch (error) {
    console.error('Create preference error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
