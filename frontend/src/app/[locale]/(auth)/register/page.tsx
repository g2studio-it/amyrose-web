import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { auth } from '@/auth';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function RegisterPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();
  if (session?.user) redirect(`/${locale}`);

  const t = await getTranslations('auth.register');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-lilac-light/30 to-brand-violet/10 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-brand-burgundy">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
