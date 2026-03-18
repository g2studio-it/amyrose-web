import NextAuth from 'next-auth';
import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import authConfig from './src/auth.config';
import { routing } from './src/i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);
const { auth } = NextAuth(authConfig);

const PROTECTED_CUSTOMER_PATHS = ['/orders'];
const PROTECTED_ADMIN_PATHS = ['/admin'];

export default auth((req: NextRequest & { auth?: { user?: { role?: string } } | null }) => {
  const { pathname } = req.nextUrl;

  // Strip locale prefix to check the route
  const localePattern = /^\/(es|en)/;
  const pathWithoutLocale = pathname.replace(localePattern, '') || '/';

  const isAdminPath = PROTECTED_ADMIN_PATHS.some((p) =>
    pathWithoutLocale.startsWith(p)
  );
  const isCustomerProtectedPath = PROTECTED_CUSTOMER_PATHS.some((p) =>
    pathWithoutLocale.startsWith(p)
  );

  const session = req.auth;
  const locale = pathname.match(localePattern)?.[1] ?? routing.defaultLocale;

  if (isAdminPath) {
    if (!session?.user) {
      return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL(`/${locale}`, req.url));
    }
  }

  if (isCustomerProtectedPath && !session?.user) {
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
