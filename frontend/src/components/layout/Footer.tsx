import { useTranslations } from 'next-intl';

export function Footer() {
  return (
    <footer className="border-t border-nav-lilac-divider dark:border-dm-secondary/30 bg-nav-lilac-bg dark:bg-[#1E1B22] py-8 text-center text-sm text-muted-foreground transition-colors">
      <p>© {new Date().getFullYear()} Amy Rose Bakery. Todos los derechos reservados.</p>
    </footer>
  );
}
