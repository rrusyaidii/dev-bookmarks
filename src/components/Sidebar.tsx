'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
}: {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-bg/80 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-surface transition-[width,transform] duration-200 ${
          collapsed ? 'w-16' : 'w-56'
        } ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className={`border-b border-border px-4 py-5 ${collapsed ? 'px-3' : ''}`}>
          <Link href="/" onClick={onClose} className="block">
            {!collapsed ? (
              <>
                <span className="font-display text-2xl font-medium tracking-tight text-fg">
                  DevMark
                </span>
                <span className="mt-2 block h-px w-10 bg-accent" aria-hidden />
              </>
            ) : (
              <span className="font-display text-xl text-accent" title="DevMark">
                D
              </span>
            )}
          </Link>
        </div>

        <nav className="flex-1 space-y-0.5 px-2 py-4">
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
                className={`relative flex min-h-11 items-center gap-3 px-3 py-2.5 text-sm transition-colors duration-200 ${
                  isActive
                    ? 'bg-surface-hover text-accent'
                    : 'text-muted hover:bg-surface-hover hover:text-fg'
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 bg-accent"
                    aria-hidden
                  />
                )}
                <item.icon />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div
          className={`border-t border-border p-3 ${collapsed ? 'flex justify-center' : 'flex items-center gap-2'}`}
        >
          <button
            onClick={onToggleCollapse}
            className="flex size-11 cursor-pointer items-center justify-center text-muted transition-colors hover:text-fg"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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
              className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          {!collapsed && <span className="font-mono text-[11px] text-muted">Collapse</span>}
        </div>
      </aside>
    </>
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
