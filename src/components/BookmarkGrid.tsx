'use client';

import { Bookmark } from '@/types';
import { useEffect, useState, useCallback } from 'react';
import CopyLinkIcon from './CopyLinkIcon';
import EditBookmarkModal from './EditBookmarkModal';
import { useViewMode } from '@/hooks/use-view-mode';
import { formatTagLabel } from '@/lib/tag-colors';

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }
}

function statusLabel(status: Bookmark['linkStatus']): string | null {
  if (status === 'broken') return 'Broken';
  if (status === 'redirect') return 'Redirect';
  return null;
}

function faviconFallback(size: number) {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'%3E%3Crect fill='%23808080' fill-opacity='0.25' width='${size}' height='${size}'/%3E%3C/svg%3E`;
}

function Skeleton({ cards }: { cards: boolean }) {
  if (cards) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="shelf-card space-y-3 p-4">
            <div className="flex gap-3">
              <div className="skeleton size-5 shrink-0" />
              <div className="skeleton h-4 flex-1" />
            </div>
            <div className="skeleton h-3 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-2 py-3">
          <div className="skeleton size-5 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-2/5" />
            <div className="skeleton h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BookmarkGrid({
  bookmarks,
  category,
  emptyMessage,
  dragEnabled,
  onDeleted,
  onUpdated,
}: {
  bookmarks: Bookmark[];
  category: string;
  emptyMessage?: string;
  dragEnabled?: boolean;
  onDeleted?: (id: string) => void;
  onUpdated?: (bookmark: Bookmark) => void;
}) {
  const view = useViewMode();
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Bookmark | null>(null);
  const [checkingId, setCheckingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(t);
  }, [category, view]);

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

  if (loading) return <Skeleton cards={view === 'cards'} />;

  if (bookmarks.length === 0) {
    return (
      <div className="border-y border-dashed border-border py-20 text-center">
        <p className="text-sm font-medium text-fg">No bookmarks found</p>
        <p className="mt-2 text-sm text-muted">
          {emptyMessage ??
            (category === 'all'
              ? 'Your collection is empty. Add your first bookmark.'
              : `Nothing tagged “${formatTagLabel(category)}”.`)}
        </p>
      </div>
    );
  }

  const actions = {
    copiedId,
    deletingId,
    checkingId,
    onFavorite: handleToggleFavorite,
    onEdit: setEditing,
    onCopy: handleCopy,
    onCheck: handleCheckLink,
    onDelete: handleDelete,
  };

  return (
    <>
      {view === 'cards' ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {bookmarks.map((bookmark, i) => (
            <CardItem
              key={bookmark.id}
              bookmark={bookmark}
              index={i}
              dragEnabled={dragEnabled}
              {...actions}
            />
          ))}
        </ul>
      ) : (
        <ul className="divide-y divide-border">
          {bookmarks.map((bookmark, i) => (
            <ListItem
              key={bookmark.id}
              bookmark={bookmark}
              index={i}
              dragEnabled={dragEnabled}
              {...actions}
            />
          ))}
        </ul>
      )}

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

type RowActions = {
  copiedId: string | null;
  deletingId: string | null;
  checkingId: string | null;
  onFavorite: (b: Bookmark) => void;
  onEdit: (b: Bookmark) => void;
  onCopy: (b: Bookmark) => void;
  onCheck: (b: Bookmark) => void;
  onDelete: (b: Bookmark) => void;
};

function ActionCluster({
  bookmark,
  copiedId,
  deletingId,
  checkingId,
  onFavorite,
  onEdit,
  onCopy,
  onCheck,
  onDelete,
}: { bookmark: Bookmark } & RowActions) {
  return (
    <div className="flex shrink-0 flex-wrap items-center opacity-100 transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
      <IconBtn
        title={bookmark.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        onClick={() => onFavorite(bookmark)}
        className={bookmark.isFavorite ? 'text-accent' : ''}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill={bookmark.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </IconBtn>
      <IconBtn title="Edit bookmark" onClick={() => onEdit(bookmark)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      </IconBtn>
      <IconBtn title={copiedId === bookmark.id ? 'Copied!' : 'Copy link'} onClick={() => onCopy(bookmark)}>
        {copiedId === bookmark.id ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-green">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <CopyLinkIcon />
        )}
      </IconBtn>
      <IconBtn
        title={checkingId === bookmark.id ? 'Checking…' : 'Check link health'}
        onClick={() => onCheck(bookmark)}
        disabled={checkingId === bookmark.id}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <path d="M22 4 12 14.01l-3-3" />
        </svg>
      </IconBtn>
      <IconBtn
        title="Delete bookmark"
        onClick={() => onDelete(bookmark)}
        disabled={deletingId === bookmark.id}
        danger
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 6h18" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        </svg>
      </IconBtn>
    </div>
  );
}

function ListItem({
  bookmark,
  index,
  dragEnabled,
  ...actions
}: { bookmark: Bookmark; index: number; dragEnabled?: boolean } & RowActions) {
  const domain = domainOf(bookmark.url);
  const tags = bookmark.tags.slice(0, 3).map(formatTagLabel);
  const extra = bookmark.tags.length - tags.length;
  const status = statusLabel(bookmark.linkStatus);
  const date = new Date(bookmark.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const meta = [domain, ...tags, extra > 0 ? `+${extra}` : null, status, date].filter(
    Boolean
  ) as string[];
  const [dragging, setDragging] = useState(false);

  return (
    <li
      className={`forge-row forge-enter group flex items-start gap-3 px-1 py-3 sm:px-2 ${
        dragEnabled ? 'cursor-grab active:cursor-grabbing' : ''
      } ${dragging ? 'opacity-40' : ''}`}
      style={{ ['--i' as string]: Math.min(index, 12) }}
      draggable={dragEnabled}
      onDragStart={
        dragEnabled
          ? (e) => {
              e.dataTransfer.setData('text/plain', bookmark.id);
              e.dataTransfer.effectAllowed = 'move';
              setDragging(true);
            }
          : undefined
      }
      onDragEnd={dragEnabled ? () => setDragging(false) : undefined}
    >
      <img
        src={bookmark.favicon}
        alt=""
        className="mt-1 size-5 shrink-0 opacity-80"
        onError={(e) => {
          (e.target as HTMLImageElement).src = faviconFallback(20);
        }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 font-display text-base font-bold tracking-tight text-fg transition-colors hover:text-accent sm:truncate"
          >
            {bookmark.isFavorite && (
              <span className="mr-1.5 text-accent" title="Favorite">
                ★
              </span>
            )}
            {bookmark.title}
          </a>
          <ActionCluster bookmark={bookmark} {...actions} />
        </div>
        <p className="mt-1 truncate font-mono text-[11px] text-muted">
          {meta.map((part, idx) => (
            <span key={`${part}-${idx}`}>
              {idx > 0 && (
                <span className="mx-1.5 text-muted/45" aria-hidden>
                  ·
                </span>
              )}
              <span
                className={
                  part === 'Broken' ? 'text-red' : part === 'Redirect' ? 'text-accent' : undefined
                }
              >
                {part}
              </span>
            </span>
          ))}
        </p>
        {bookmark.notes && (
          <p className="mt-1 truncate font-mono text-[11px] text-muted/80">
            Note · {bookmark.notes}
          </p>
        )}
      </div>
    </li>
  );
}

function CardItem({
  bookmark,
  index,
  dragEnabled,
  ...actions
}: { bookmark: Bookmark; index: number; dragEnabled?: boolean } & RowActions) {
  const domain = domainOf(bookmark.url);
  const tags = bookmark.tags.slice(0, 2).map(formatTagLabel);
  const status = statusLabel(bookmark.linkStatus);
  const date = new Date(bookmark.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const meta = [...tags, status, date].filter(Boolean) as string[];
  const [dragging, setDragging] = useState(false);

  return (
    <li
      className={`signal-enter shelf-card group flex flex-col p-4 ${
        dragEnabled ? 'cursor-grab active:cursor-grabbing' : ''
      } ${dragging ? 'opacity-40' : ''}`}
      style={{ ['--i' as string]: Math.min(index, 12) }}
      draggable={dragEnabled}
      onDragStart={
        dragEnabled
          ? (e) => {
              e.dataTransfer.setData('text/plain', bookmark.id);
              e.dataTransfer.effectAllowed = 'move';
              setDragging(true);
            }
          : undefined
      }
      onDragEnd={dragEnabled ? () => setDragging(false) : undefined}
    >
      <div className="flex flex-col gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <img
            src={bookmark.favicon}
            alt=""
            className="mt-0.5 size-5 shrink-0 opacity-80"
            onError={(e) => {
              (e.target as HTMLImageElement).src = faviconFallback(20);
            }}
          />
          <div className="min-w-0 flex-1">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="line-clamp-2 font-display text-base font-bold tracking-tight text-fg transition-colors hover:text-accent"
            >
              {bookmark.isFavorite && (
                <span className="mr-1.5 text-accent" title="Favorite">
                  ★
                </span>
              )}
              {bookmark.title}
            </a>
            <p className="mt-1 truncate font-mono text-[11px] text-muted">{domain}</p>
          </div>
        </div>
        <ActionCluster bookmark={bookmark} {...actions} />
      </div>

      {meta.length > 0 && (
        <p className="mt-3 truncate font-mono text-[11px] text-muted">
          {meta.map((part, idx) => (
            <span key={`${part}-${idx}`}>
              {idx > 0 && (
                <span className="mx-1.5 text-muted/45" aria-hidden>
                  ·
                </span>
              )}
              <span
                className={
                  part === 'Broken' ? 'text-red' : part === 'Redirect' ? 'text-accent' : undefined
                }
              >
                {part}
              </span>
            </span>
          ))}
        </p>
      )}

      {bookmark.notes && (
        <p className="mt-2 line-clamp-1 font-mono text-[11px] text-muted/80">
          Note · {bookmark.notes}
        </p>
      )}
    </li>
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
