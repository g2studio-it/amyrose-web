import { getTranslations } from 'next-intl/server';
import { CartView } from '@/components/shop/CartView';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function CartPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('cart');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-extrabold text-brand-burgundy">{t('title')}</h1>
        <CartView locale={locale} />
      </div>
    </div>
  );
}
