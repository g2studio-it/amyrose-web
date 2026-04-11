import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/LoginForm';
import { auth } from '@/auth';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();
  if (session?.user) {
    redirect(session.user.role === 'ADMIN' ? `/${locale}/admin/dashboard` : `/${locale}`);
  }
  const t = await getTranslations('auth.login');

  return (
    <div className="from-brand-lilac-light/30 to-brand-violet/10 flex min-h-screen items-center justify-center bg-linear-to-br px-4">
      <div className="w-full max-w-md">
        <Link
          href={`/${locale}`}
          className="text-brand-burgundy mb-4 inline-flex items-center gap-2 text-sm hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="text-brand-burgundy text-center">
              {t('title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
