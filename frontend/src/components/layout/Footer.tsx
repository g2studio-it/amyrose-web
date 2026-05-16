export function Footer() {
  return (
    <footer className="border-t border-nav-lilac-divider dark:border-dm-secondary/30 bg-nav-lilac-bg dark:bg-[#1E1B22] py-8 text-center text-sm text-muted-foreground transition-colors">
      <p>© {new Date().getFullYear()} Amy Rose Bakery. Todos los derechos reservados.</p>
      <p className="mt-1.5 text-xs">
        Desarrollado por{' '}
        <a
          href="https://g2studio.it.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-brand-burgundy hover:underline"
        >
          g2studio
        </a>
      </p>
    </footer>
  );
}
