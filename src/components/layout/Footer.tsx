import { useTranslations } from 'next-intl';

export function Footer() {
  return (
    <footer className="border-t border-brand-violet/20 bg-brand-violet/5 py-8 text-center text-sm text-muted-foreground">
      <p>© {new Date().getFullYear()} Amy Rose Bakery. Todos los derechos reservados.</p>
    </footer>
  );
}
