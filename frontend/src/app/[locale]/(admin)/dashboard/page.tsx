import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const t = useTranslations('admin.dashboard');

  return (
    <div>
      <h1 className="mb-8 text-3xl font-semibold text-brand-burgundy">{t('title')}</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { key: 'revenue', value: '$0' },
          { key: 'orders', value: '0' },
          { key: 'products', value: '0' },
          { key: 'customers', value: '0' },
        ].map(({ key, value }) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t(key as 'revenue' | 'orders' | 'products' | 'customers')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-brand-burgundy">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
