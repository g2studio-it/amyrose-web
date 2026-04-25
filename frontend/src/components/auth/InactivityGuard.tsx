'use client';

import { useEffect, useRef } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';

const INACTIVITY_LIMIT = 2 * 60 * 60 * 1000; // 2 hours
const CHECK_INTERVAL = 60 * 1000; // check every minute

export function InactivityGuard() {
  const { status } = useSession();
  const locale = useLocale();
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    if (status !== 'authenticated') return;

    const resetTimer = () => {
      lastActivityRef.current = Date.now();
    };

    const checkAndSignOut = () => {
      if (Date.now() - lastActivityRef.current > INACTIVITY_LIMIT) {
        signOut({ callbackUrl: `/${locale}` });
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAndSignOut();
      }
    };

    const events = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'] as const;
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const interval = setInterval(checkAndSignOut, CHECK_INTERVAL);

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [status, locale]);

  return null;
}
