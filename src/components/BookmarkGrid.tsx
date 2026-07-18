'use client';

import { Bookmark } from '@/types';
import { useEffect, useState, useCallback } from 'react';
import CopyLinkIcon from './CopyLinkIcon';
import EditBookmarkModal from './EditBookmarkModal';
import { formatTagLabel } from '@/lib/tag-colors';

function SkeletonList() {
  return (
    <div className="divide-y divide-border border border-border">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4">
          <div className="skeleton size-7 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-2/5" />
            <div className="skeleton h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function LinkStatusBadge({ status }: { status: Bookmark['linkStatus'] }) {
  if (status === 'unknown') return null;
  const map = {
    ok: { label: 'OK', className: 'text-green' },
    broken: { label: 'Broken', className: 'text-red' },
    redirect: { label: 'Redirect', className: 'text-accent' },
  } as const;
  const item = map[status];
  if (!item) return null;
  return (
    <span className={`font-mono text-[10px] uppercase tracking-wider ${item.className}`}>
      {item.label}
    </span>
  );
}

export default function BookmarkGrid({
  bookmarks,
  category,
  onDeleted,
  onUpdated,
}: {
  bookmarks: Bookmark[];
  category: string;
  onDeleted?: (id: string) => void;
  onUpdated?: (bookmark: Bookmark) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Bookmark | null>(null);
  const [checkingId, setCheckingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(t);
  }, [category]);

  const handleCopy = useCallback(async (bookmark: Bookmark) => {
    try {
      await navigator.clipboard.writeText(bookmark.url);
      setCopiedId(bookmark.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = bookmark.url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedId(bookmark.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  const handleDelete = useCallback(
    async (bookmark: Bookmark) => {
      if (!window.confirm(`Delete "${bookmark.title}"?`)) return;
      setDeletingId(bookmark.id);
      try {
        const res = await fetch(`/api/bookmarks/${bookmark.id}`, { method: 'DELETE' });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to delete');
        }
        onDeleted?.(bookmark.id);
      } catch (err) {
        window.alert(err instanceof Error ? err.message : 'Failed to delete bookmark');
      } finally {
        setDeletingId(null);
      }
    },
    [onDeleted]
  );

  const handleToggleFavorite = useCallback(
    async (bookmark: Bookmark) => {
      try {
        const res = await fetch(`/api/bookmarks/${bookmark.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isFavorite: !bookmark.isFavorite }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update');
        onUpdated?.(data);
      } catch (err) {
        window.alert(err instanceof Error ? err.message : 'Failed to update favorite');
      }
    },
    [onUpdated]
  );

  const handleCheckLink = useCallback(
    async (bookmark: Bookmark) => {
      setCheckingId(bookmark.id);
      try {
        const res = await fetch('/api/bookmarks/check-links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: [bookmark.id] }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to check link');
        const updated = data.bookmarks?.[0];
        if (updated) onUpdated?.(updated);
      } catch (err) {
        window.alert(err instanceof Error ? err.message : 'Failed to check link');
      } finally {
        setCheckingId(null);
      }
    },
    [onUpdated]
  );

  if (loading) return <SkeletonList />;

  if (bookmarks.length === 0) {
    return (
      <div className="border border-dashed border-border px-4 py-20 text-center">
        <p className="text-sm font-medium text-fg">No bookmarks found</p>
        <p className="mt-2 text-sm text-muted">
          {category === 'all'
            ? 'Your collection is empty. Add your first bookmark.'
            : `Nothing tagged “${category}”.`}
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="divide-y divide-border border border-border">
        {bookmarks.map((bookmark) => (
          <li
            key={bookmark.id}
            className="group flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-surface sm:flex-row sm:items-start"
          >
            <img
              src={bookmark.favicon}
              alt=""
              className="mt-0.5 size-7 shrink-0 border border-border bg-bg"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Crect fill='%231c1917' width='28' height='28'/%3E%3C/svg%3E";
              }}
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-sm font-medium text-fg transition-colors hover:text-accent"
                  >
                    {bookmark.isFavorite && (
                      <span className="mr-1.5 text-accent" title="Favorite">
                        ★
                      </span>
                    )}
                    {bookmark.title}
                  </a>
                  <p className="mt-0.5 truncate font-mono text-[11px] text-muted">
                    {bookmark.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-0.5 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                  <IconBtn
                    title={bookmark.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    onClick={() => handleToggleFavorite(bookmark)}
                    className={bookmark.isFavorite ? 'text-accent' : ''}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill={bookmark.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </IconBtn>
                  <IconBtn title="Edit bookmark" onClick={() => setEditing(bookmark)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </IconBtn>
                  <IconBtn
                    title={copiedId === bookmark.id ? 'Copied!' : 'Copy link'}
                    onClick={() => handleCopy(bookmark)}
                  >
                    {copiedId === bookmark.id ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-green">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      <CopyLinkIcon />
                    )}
                  </IconBtn>
                  <IconBtn
                    title={checkingId === bookmark.id ? 'Checking…' : 'Check link health'}
                    onClick={() => handleCheckLink(bookmark)}
                    disabled={checkingId === bookmark.id}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <path d="M22 4 12 14.01l-3-3" />
                    </svg>
                  </IconBtn>
                  <IconBtn
                    title="Delete bookmark"
                    onClick={() => handleDelete(bookmark)}
                    disabled={deletingId === bookmark.id}
                    danger
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M3 6h18" />
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    </svg>
                  </IconBtn>
                </div>
              </div>

              {bookmark.description && (
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
                  {bookmark.description}
                </p>
              )}
              {bookmark.notes && (
                <p className="mt-1 font-mono text-[11px] text-muted">
                  Note · {bookmark.notes}
                </p>
              )}

              <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                {bookmark.tags.map((tag) => (
                  <span key={tag} className="font-mono text-[11px] text-muted">
                    {formatTagLabel(tag)}
                  </span>
                ))}
                <LinkStatusBadge status={bookmark.linkStatus} />
                <time
                  className="ml-auto font-mono text-[11px] text-muted"
                  dateTime={bookmark.createdAt}
                >
                  {new Date(bookmark.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </time>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <EditBookmarkModal
        bookmark={editing}
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        onSaved={(b) => {
          onUpdated?.(b);
          setEditing(b);
        }}
      />
    </>
  );
}

function IconBtn({
  children,
  title,
  onClick,
  disabled,
  danger,
  className = '',
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`flex size-9 cursor-pointer items-center justify-center text-muted transition-colors hover:text-fg disabled:opacity-40 ${
        danger ? 'hover:text-red' : 'hover:text-accent'
      } ${className}`}
    >
      {children}
    </button>
  );
}
