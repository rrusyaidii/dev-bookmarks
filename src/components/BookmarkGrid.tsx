'use client';

import { Bookmark } from '@/types';
import { useEffect, useState, useCallback } from 'react';
import CopyLinkIcon from './CopyLinkIcon';
import EditBookmarkModal from './EditBookmarkModal';
import { getTagColor } from '@/lib/tag-colors';

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="glass rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="skeleton size-8 shrink-0 rounded-lg" />
            <div className="skeleton h-4 flex-1" />
          </div>
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-4/5" />
          <div className="flex gap-2 mt-2">
            <div className="skeleton h-5 w-14 rounded-md" />
            <div className="skeleton h-5 w-16 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

function LinkStatusBadge({ status }: { status: Bookmark['linkStatus'] }) {
  if (status === 'unknown') return null;
  const map = {
    ok: { label: 'OK', className: 'text-green bg-green/10' },
    broken: { label: 'Broken', className: 'text-red bg-red/10' },
    redirect: { label: 'Redirect', className: 'text-yellow bg-yellow/10' },
  } as const;
  const item = map[status];
  if (!item) return null;
  return (
    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${item.className}`}>
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
    const t = setTimeout(() => setLoading(false), 300);
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

  if (loading) return <SkeletonGrid />;

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl py-24">
        <div className="text-muted opacity-40">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
            <path d="M9 2v5l3-2 3 2V2" />
          </svg>
        </div>
        <p className="text-base font-medium text-muted">No bookmarks found</p>
        <p className="text-sm text-muted">
          {category === 'all'
            ? 'Your collection is empty. Add your first bookmark!'
            : `No bookmarks tagged under "${category}". Try a different filter.`}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bookmarks.map((bookmark, i) => (
          <div
            key={bookmark.id}
            className="group relative glass rounded-xl p-4 transition-all duration-200 hover:scale-[1.02] hover:border-border/80 hover:shadow-lg hover:shadow-black/20"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-start gap-3">
              <img
                src={bookmark.favicon}
                alt=""
                className="size-8 shrink-0 rounded-lg bg-surface"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Crect fill='%232a2d3a' width='32' height='32' rx='8'/%3E%3C/svg%3E";
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-sm font-semibold text-fg hover:text-accent transition-colors"
                  >
                    {bookmark.title}
                  </a>
                  {bookmark.isFavorite && (
                    <span className="text-yellow text-xs" title="Favorite">★</span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-muted">
                  {bookmark.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-all group-hover:opacity-100">
                <button
                  onClick={() => handleToggleFavorite(bookmark)}
                  className={`rounded-lg p-1.5 transition-all hover:bg-surface-hover ${
                    bookmark.isFavorite ? 'text-yellow' : 'text-muted hover:text-yellow'
                  }`}
                  aria-label="Toggle favorite"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={bookmark.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
                <button
                  onClick={() => setEditing(bookmark)}
                  className="rounded-lg p-1.5 text-muted transition-all hover:bg-surface-hover hover:text-accent"
                  aria-label="Edit bookmark"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleCopy(bookmark)}
                  className="rounded-lg p-1.5 text-muted transition-all hover:bg-surface-hover hover:text-accent"
                  aria-label="Copy link"
                >
                  {copiedId === bookmark.id ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    <CopyLinkIcon />
                  )}
                </button>
                <button
                  onClick={() => handleCheckLink(bookmark)}
                  disabled={checkingId === bookmark.id}
                  className="rounded-lg p-1.5 text-muted transition-all hover:bg-surface-hover hover:text-accent disabled:opacity-50"
                  aria-label="Check link"
                  title="Check link health"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <path d="M22 4 12 14.01l-3-3" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(bookmark)}
                  disabled={deletingId === bookmark.id}
                  className="rounded-lg p-1.5 text-muted transition-all hover:bg-surface-hover hover:text-red disabled:opacity-50"
                  aria-label="Delete bookmark"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                </button>
              </div>
            </div>

            <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-muted">
              {bookmark.description}
            </p>

            {bookmark.notes && (
              <p className="mt-1.5 line-clamp-1 text-[11px] italic text-muted/80">
                Note: {bookmark.notes}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {bookmark.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium"
                  style={{
                    backgroundColor: `${getTagColor(tag)}15`,
                    color: getTagColor(tag),
                  }}
                >
                  {tag}
                </span>
              ))}
              <LinkStatusBadge status={bookmark.linkStatus} />
            </div>

            <time className="mt-2 block text-[11px] text-muted opacity-60" dateTime={bookmark.createdAt}>
              {new Date(bookmark.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          </div>
        ))}
      </div>

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
