'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { ModeToggle } from '@/components/AppearanceControls';
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
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-bg px-2 sm:gap-3 sm:px-3 md:px-5">
      <button
        type="button"
        onClick={onMenuToggle}
        className="flex size-11 shrink-0 cursor-pointer items-center justify-center text-muted transition-colors hover:text-fg md:hidden"
        aria-label="Open menu"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <line x1="3" y1="5" x2="17" y2="5" />
          <line x1="3" y1="10" x2="17" y2="10" />
          <line x1="3" y1="15" x2="17" y2="15" />
        </svg>
      </button>

      <form onSubmit={handleSearch} className="relative min-w-0 flex-1 md:mx-auto md:max-w-sm">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="h-10 w-full rounded-[10px] border border-border bg-surface pl-9 pr-3 font-mono text-sm text-fg placeholder-muted outline-none transition-colors focus:border-accent"
        />
      </form>

      <ModeToggle className="shrink-0" />

      <div className="hidden shrink-0 items-center gap-3 sm:flex">
        {userEmail && (
          <span className="hidden max-w-[140px] truncate font-mono text-[11px] text-muted lg:inline" title={userEmail}>
            {userEmail}
          </span>
        )}
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="min-h-11 cursor-pointer px-1 font-mono text-[11px] uppercase tracking-wider text-muted transition-colors hover:text-accent disabled:opacity-50"
        >
          {signingOut ? '…' : 'Sign out'}
        </button>
      </div>
    </header>
  );
}
