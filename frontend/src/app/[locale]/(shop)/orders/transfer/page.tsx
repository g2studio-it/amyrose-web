import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getOrderAction } from '@/actions/orders';
import { TransferForm } from '@/components/shop/TransferForm';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ orderId?: string }>;
}

export default async function TransferPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { orderId } = await searchParams;

  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);
  if (!orderId) redirect(`/${locale}/orders`);

  const order = await getOrderAction(orderId);
  if (!order) redirect(`/${locale}/orders`);

  return <TransferForm order={order} locale={locale} />;
}
