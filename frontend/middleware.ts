import NextAuth from 'next-auth';
import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import authConfig from './src/auth.config';
import { routing } from './src/i18n/routing';

// Edge-compatible auth (no Prisma — reads JWT directly)
const { auth } = NextAuth(authConfig);

const intlMiddleware = createIntlMiddleware(routing);

const LOCALES = ['es', 'en'];
const DEFAULT_LOCALE = 'es';

// Routes that require the user to be ADMIN
const ADMIN_PREFIX = '/admin';

// Routes that require any authenticated user
const AUTH_REQUIRED = ['/orders', '/profile'];

// Auth pages — authenticated users should be redirected away
const AUTH_PAGES = ['/login', '/register'];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Determine locale from path
  const locale =
    LOCALES.find((l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`) ??
    DEFAULT_LOCALE;

  const pathWithoutLocale = pathname.slice(`/${locale}`.length) || '/';

  const session = req.auth;
  const isAuthenticated = !!session?.user;
  const isAdmin = session?.user?.role === 'ADMIN';

  // ── Admin-only ──────────────────────────────────────────────────────────
  if (pathWithoutLocale === ADMIN_PREFIX || pathWithoutLocale.startsWith(`${ADMIN_PREFIX}/`)) {
    if (!isAdmin) {
      const url = req.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      return NextResponse.redirect(url);
    }
  }

  // ── Auth-required routes ────────────────────────────────────────────────
  if (AUTH_REQUIRED.some((p) => pathWithoutLocale.startsWith(p))) {
    if (!isAuthenticated) {
      const url = req.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      return NextResponse.redirect(url);
    }
  }

  // ── Redirect authenticated users away from auth pages ───────────────────
  if (AUTH_PAGES.some((p) => pathWithoutLocale.startsWith(p))) {
    if (isAuthenticated) {
      const url = req.nextUrl.clone();
      url.pathname = isAdmin ? `/${locale}/admin/dashboard` : `/${locale}`;
      return NextResponse.redirect(url);
    }
  }

  // ── Locale routing (next-intl) ───────────────────────────────────────────
  return intlMiddleware(req);
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
