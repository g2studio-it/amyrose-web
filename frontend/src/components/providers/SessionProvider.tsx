'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { InactivityGuard } from '@/components/auth/InactivityGuard';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider refetchInterval={5 * 60} refetchOnWindowFocus>
      <InactivityGuard />
      {children}
    </NextAuthSessionProvider>
  );
}
