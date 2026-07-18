'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import AppearanceControls from '@/components/AppearanceControls';
import { createClient } from '@/lib/supabase/client';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: DashboardIcon },
  { href: '/bookmarks', label: 'Bookmarks', icon: BookmarksIcon },
  { href: '/tags', label: 'Tags', icon: TagsIcon },
  { href: '/add', label: 'Add', icon: AddIcon },
  { href: '/tools', label: 'Tools', icon: ToolsIcon },
];

export default function Sidebar({
  open,
  onClose,
  collapsed,
  onToggleCollapse,
  userEmail,
}: {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  userEmail?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  // Desktop can collapse; mobile drawer stays full-width.
  const slim = collapsed;

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    onClose();
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-bg/80 md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-border bg-surface transition-[width,transform] duration-200 ${
          slim ? 'md:w-16' : 'md:w-56'
        } ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className={`border-b border-border px-4 py-5 ${slim ? 'md:px-3' : ''}`}>
          <Link href="/" onClick={onClose} className="block">
            <span className={slim ? 'md:hidden' : undefined}>
              <span className="font-display text-2xl font-bold tracking-tight text-fg">
                DevMark
              </span>
              <span className="signal-rule mt-2 block h-0.5 w-11 rounded-full bg-accent" aria-hidden />
            </span>
            {slim && (
              <span className="hidden font-display text-xl font-bold text-accent md:inline" title="DevMark">
                D
              </span>
            )}
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={`relative flex min-h-11 items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm transition-colors duration-200 ${
                  isActive
                    ? 'bg-surface-hover text-accent'
                    : 'text-muted hover:bg-surface-hover hover:text-fg'
                } ${slim ? 'md:justify-center md:px-0' : ''}`}
                title={slim ? item.label : undefined}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-accent"
                    aria-hidden
                  />
                )}
                <item.icon />
                <span className={`font-medium ${slim ? 'md:hidden' : ''}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <AppearanceControls collapsed={slim} />

        <div className="space-y-1 border-t border-border p-3">
          {userEmail && (
            <p
              className={`truncate px-1 font-mono text-[10px] text-muted ${slim ? 'md:hidden' : ''}`}
              title={userEmail}
            >
              {userEmail}
            </p>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className={`flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-[10px] px-2 font-mono text-[11px] uppercase tracking-wider text-muted transition-colors hover:bg-surface-hover hover:text-accent disabled:opacity-50 ${
              slim ? 'md:justify-center md:px-0' : ''
            }`}
            aria-label="Sign out"
            title="Sign out"
          >
            <SignOutIcon />
            <span className={slim ? 'md:hidden' : undefined}>
              {signingOut ? '…' : 'Sign out'}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden min-h-11 w-full cursor-pointer items-center gap-2 px-2 text-muted transition-colors hover:text-fg md:flex"
            aria-label={slim ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-200 ${slim ? 'rotate-180' : ''}`}
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {!slim && <span className="font-mono text-[11px]">Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

function SignOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <rect x="3" y="3" width="7" height="9" rx="0.5" />
      <rect x="14" y="3" width="7" height="5" rx="0.5" />
      <rect x="14" y="12" width="7" height="9" rx="0.5" />
      <rect x="3" y="16" width="7" height="5" rx="0.5" />
    </svg>
  );
}

function BookmarksIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
      <path d="M9 2v5l3-2 3 2V2" />
    </svg>
  );
}

function TagsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2z" />
      <circle cx="7" cy="7" r="1.5" fill="currentColor" />
    </svg>
  );
}

function AddIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ToolsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}
