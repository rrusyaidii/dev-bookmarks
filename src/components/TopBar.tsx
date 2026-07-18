'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TopBar({
  onMenuToggle,
  userEmail,
}: {
  onMenuToggle: () => void;
  userEmail?: string | null;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [signingOut, setSigningOut] = useState(false);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/bookmarks?q=${encodeURIComponent(query.trim())}`);
      }
    },
    [query, router]
  );

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }, [router]);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-bg/80 px-3 backdrop-blur-xl md:px-4">
      <button
        onClick={onMenuToggle}
        className="flex size-9 items-center justify-center rounded-xl text-muted hover:bg-surface-hover hover:text-fg transition-colors md:hidden"
        aria-label="Toggle sidebar"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="5" x2="17" y2="5" />
          <line x1="3" y1="10" x2="17" y2="10" />
          <line x1="3" y1="15" x2="17" y2="15" />
        </svg>
      </button>

      <form onSubmit={handleSearch} className="relative mx-auto w-full max-w-md">
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search bookmarks..."
          className="h-10 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-fg placeholder-muted outline-none transition-colors focus:border-accent/40 focus:bg-surface-hover"
        />
      </form>

      <div className="hidden items-center gap-2 sm:flex">
        {userEmail && (
          <span className="max-w-[160px] truncate text-xs text-muted" title={userEmail}>
            {userEmail}
          </span>
        )}
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="h-9 rounded-xl border border-border px-3 text-xs font-medium text-muted hover:bg-surface-hover hover:text-fg disabled:opacity-50"
        >
          {signingOut ? '…' : 'Sign out'}
        </button>
      </div>
    </header>
  );
}
