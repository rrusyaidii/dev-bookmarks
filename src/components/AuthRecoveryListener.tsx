'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function isRecoveryUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const { search, hash } = window.location;
  return (
    search.includes('type=recovery') ||
    hash.includes('type=recovery') ||
    search.includes('next=/reset-password')
  );
}

/** Sends password-recovery sessions to /reset-password instead of the shelf. */
export function AuthRecoveryListener() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/reset-password') return;

    if (isRecoveryUrl()) {
      router.replace('/reset-password');
      return;
    }

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        router.replace('/reset-password');
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  return null;
}
