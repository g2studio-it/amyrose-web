import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function AdminProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = useTranslations('admin.products');

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-brand-burgundy">{t('title')}</h1>
        <Button asChild>
          <Link href={`/${locale}/admin/products/new`}>{t('new')}</Link>
        </Button>
      </div>
      <p className="text-muted-foreground">Lista de productos — próximamente</p>
    </div>
  );
}
