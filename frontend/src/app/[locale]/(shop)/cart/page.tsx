import { useTranslations } from 'next-intl';

export default function CartPage() {
  const t = useTranslations('cart');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-semibold text-brand-burgundy">{t('title')}</h1>
      <p className="text-muted-foreground">{t('empty')}</p>
    </div>
  );
}
