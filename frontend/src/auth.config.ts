import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { loginSchema } from '@/schemas/auth.schema';
import type { BackendAuthResponse } from '@/lib/api';

const BACKEND_BASE = (process.env.BACKEND_API_URL ?? 'http://localhost:3001/api/v1').replace(/\/$/, '');

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
    // Unwrap NestJS TransformInterceptor envelope: { success, data, timestamp }
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
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.backendAccessToken = user.backendAccessToken;
        token.backendRefreshToken = user.backendRefreshToken;
      }
      return token;
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
