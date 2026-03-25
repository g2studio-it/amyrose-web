import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/LoginForm';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  const t = useTranslations('auth.login');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-lilac-light/30 to-brand-violet/10 px-4">
      <div className="w-full max-w-md">
        <Link
          href={`/${locale}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-brand-burgundy hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-brand-burgundy">{t('title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
