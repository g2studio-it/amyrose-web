import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { loginSchema } from '@/schemas/auth.schema';
import type { BackendAuthResponse } from '@/lib/api';

const BACKEND_BASE = (process.env.BACKEND_API_URL ?? 'http://localhost:3001/api/v1').replace(/\/$/, '');

// Expires 60 s before real expiry so we refresh proactively
const ACCESS_TOKEN_TTL_MS = 14 * 60 * 1000; // 14 min (backend issues 15 min tokens)

async function backendLogin(
  email: string,
  password: string,
): Promise<BackendAuthResponse | null> {
  try {
    const res = await fetch(`${BACKEND_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? json) as BackendAuthResponse;
  } catch {
    return null;
  }
}

async function backendRefresh(refreshToken: string): Promise<BackendAuthResponse | null> {
  try {
    const res = await fetch(`${BACKEND_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${refreshToken}` },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? json) as BackendAuthResponse;
  } catch {
    return null;
  }
}

export default {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const data = await backendLogin(parsed.data.email, parsed.data.password);
        if (!data) return null;

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name ?? null,
          image: null,
          role: data.user.role,
          backendAccessToken: data.accessToken,
          backendRefreshToken: data.refreshToken,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // First sign-in: populate all fields from the user returned by authorize()
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.backendAccessToken = user.backendAccessToken;
        token.backendRefreshToken = user.backendRefreshToken;
        token.backendAccessTokenExpiry = Date.now() + ACCESS_TOKEN_TTL_MS;
        return token;
      }

      // Subsequent requests: refresh backend token if expired
      const expiry = token.backendAccessTokenExpiry as number | undefined;
      if (expiry && Date.now() < expiry) {
        // Token still valid
        return token;
      }

      // Token expired — try to refresh
      const refreshToken = token.backendRefreshToken as string | undefined;
      if (!refreshToken) {
        // No refresh token → clear backend tokens so the user is re-challenged
        return { ...token, backendAccessToken: undefined, backendRefreshToken: undefined };
      }

      const refreshed = await backendRefresh(refreshToken);
      if (!refreshed) {
        // Refresh failed (token revoked / backend down) → force re-login
        return { ...token, backendAccessToken: undefined, backendRefreshToken: undefined };
      }

      return {
        ...token,
        backendAccessToken: refreshed.accessToken,
        backendRefreshToken: refreshed.refreshToken,
        backendAccessTokenExpiry: Date.now() + ACCESS_TOKEN_TTL_MS,
      };
    },

    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.backendAccessToken = token.backendAccessToken as string | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
