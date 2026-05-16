import NextAuth from 'next-auth';
import authConfig from './auth.config';

// JWT-only strategy: sessions live entirely in the signed cookie.
// No database adapter — user data comes from the backend JWT and is
// embedded in the NextAuth token via the jwt() callback in auth.config.ts.
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt', maxAge: 2 * 60 * 60 },
  ...authConfig,
});
