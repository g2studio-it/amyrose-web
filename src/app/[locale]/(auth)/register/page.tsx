import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  const t = useTranslations('auth.register');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-lilac-light/30 to-brand-violet/10 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-brand-burgundy">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Formulario de registro — próximamente</p>
        </CardContent>
      </Card>
    </div>
  );
}
