import { createHmac } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paymentClient } from '@/lib/mercadopago';

function verifySignature(req: NextRequest, rawBody: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return true; // skip verification if secret not configured

  const xSignature = req.headers.get('x-signature');
  const xRequestId = req.headers.get('x-request-id');
  const dataId = new URL(req.url).searchParams.get('data.id');

  if (!xSignature) return false;

  // Parse ts and v1 from x-signature header: "ts=...,v1=..."
  const parts = Object.fromEntries(
    xSignature.split(',').map((p) => p.trim().split('=')),
  );
  const { ts, v1 } = parts;
  if (!ts || !v1) return false;

  const signedParts = [
    dataId ? `id:${dataId}` : null,
    xRequestId ? `request-id:${xRequestId}` : null,
    `ts:${ts}`,
  ]
    .filter(Boolean)
    .join(';');

  const expected = createHmac('sha256', secret).update(signedParts).digest('hex');
  return expected === v1;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    if (!verifySignature(req, rawBody)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const { type, data } = body;

    if (type !== 'payment' || !data?.id) {
      return NextResponse.json({ ok: true });
    }

    const payment = await paymentClient.get({ id: data.id });

    // Use external_reference (we set this to our order ID in create-preference)
    const orderId = payment.external_reference;
    const mpPaymentId = payment.id?.toString();

    if (!orderId) {
      return NextResponse.json({ ok: true });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ ok: true });
    }

    const paymentStatusMap: Record<string, 'PENDING' | 'APPROVED' | 'REJECTED'> = {
      approved: 'APPROVED',
      rejected: 'REJECTED',
      pending: 'PENDING',
      in_process: 'PENDING',
      cancelled: 'REJECTED',
      refunded: 'REJECTED',
      charged_back: 'REJECTED',
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

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
