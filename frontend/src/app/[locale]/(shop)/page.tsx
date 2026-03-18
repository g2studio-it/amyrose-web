import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <div>
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center justify-center bg-gradient-to-br from-brand-burgundy via-brand-violet to-brand-lilac-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight">{t('hero.title')}</h1>
          <p className="mb-8 text-xl text-brand-lilac-light">{t('hero.subtitle')}</p>
          <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-brand-burgundy">
            <Link href="catalog">{t('hero.cta')}</Link>
          </Button>
        </div>
      </section>

      {/* Featured products placeholder */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-8 text-3xl font-semibold text-brand-burgundy">{t('featured')}</h2>
        <p className="text-muted-foreground">Próximamente...</p>
      </section>
    </div>
  );
}
