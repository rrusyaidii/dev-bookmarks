'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Bookmark, Folder } from '@/types';
import BookmarkGrid from '@/components/BookmarkGrid';

export default function LibraryPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [active, setActive] = useState<string>('all');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [creating, setCreating] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const loadFolders = useCallback(() => {
    return fetch('/api/folders')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Folder[]) => setFolders(data))
      .catch(() => setFolders([]));
  }, []);

  useEffect(() => {
    loadFolders().finally(() => setFoldersLoading(false));
  }, [loadFolders]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const qs = active === 'all' ? '' : `?folder=${encodeURIComponent(active)}`;
    fetch(`/api/bookmarks${qs}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load bookmarks');
        return res.json();
      })
      .then((data: Bookmark[]) => setBookmarks(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [active]);

  const handleCreateFolder = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const name = newFolderName.trim();
      if (!name) return;
      setCreating(true);
      try {
        const res = await fetch('/api/folders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create folder');
        setFolders((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
        setNewFolderName('');
        setActive(data.id);
      } catch (err) {
        window.alert(err instanceof Error ? err.message : 'Failed to create folder');
      } finally {
        setCreating(false);
      }
    },
    [newFolderName]
  );

  const handleRename = useCallback(
    async (id: string) => {
      const name = renameValue.trim();
      if (!name) {
        setRenamingId(null);
        return;
      }
      try {
        const res = await fetch(`/api/folders/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to rename folder');
        setFolders((prev) =>
          prev
            .map((f) => (f.id === id ? { ...f, name: data.name } : f))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      } catch (err) {
        window.alert(err instanceof Error ? err.message : 'Failed to rename folder');
      } finally {
        setRenamingId(null);
      }
    },
    [renameValue]
  );

  const handleDelete = useCallback(
    async (folder: Folder) => {
      if (!window.confirm(`Delete folder "${folder.name}"? Bookmarks inside stay, just unfiled.`))
        return;
      try {
        const res = await fetch(`/api/folders/${folder.id}`, { method: 'DELETE' });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to delete folder');
        }
        setFolders((prev) => prev.filter((f) => f.id !== folder.id));
        if (active === folder.id) setActive('all');
      } catch (err) {
        window.alert(err instanceof Error ? err.message : 'Failed to delete folder');
      }
    },
    [active]
  );

  const handleDropOnFolder = useCallback(
    async (targetId: string, bookmarkId: string) => {
      const bookmark = bookmarks.find((b) => b.id === bookmarkId);
      if (!bookmark) return;

      const currentNames = bookmark.folders.map((f) => f.name);
      let newNames: string[];
      if (targetId === 'unfiled') {
        if (currentNames.length === 0) return;
        newNames = [];
      } else {
        const folder = folders.find((f) => f.id === targetId);
        if (!folder || currentNames.includes(folder.name)) return;
        newNames = [...currentNames, folder.name];
      }

      try {
        const res = await fetch(`/api/bookmarks/${bookmarkId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folders: newNames }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to move bookmark');

        setBookmarks((prev) => {
          const stillMatches =
            active === 'all'
              ? true
              : active === 'unfiled'
                ? data.folders.length === 0
                : data.folders.some((f: { id: string }) => f.id === active);
          if (!stillMatches) return prev.filter((b) => b.id !== data.id);
          return prev.map((b) => (b.id === data.id ? data : b));
        });
        loadFolders();
      } catch (err) {
        window.alert(err instanceof Error ? err.message : 'Failed to move bookmark');
      }
    },
    [bookmarks, folders, active, loadFolders]
  );

  const activeLabel = useMemo(() => {
    if (active === 'all') return 'All bookmarks';
    if (active === 'unfiled') return 'Unfiled';
    return folders.find((f) => f.id === active)?.name ?? 'Folder';
  }, [active, folders]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="signal-enter mb-8" style={{ ['--i' as string]: 0 }}>
        <h1 className="font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">
          Library
        </h1>
        <p className="mt-2 font-mono text-xs text-muted">Bookmarks organized into folders.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <div className="signal-enter space-y-5 lg:col-span-1" style={{ ['--i' as string]: 1 }}>
          <div>
            <p className="signal-section-title mb-2 font-mono text-[11px] uppercase tracking-wider text-muted">
              Folders
            </p>
            <p className="mb-2 text-xs text-muted">Drag a bookmark onto a folder to file it.</p>

            {foldersLoading ? (
              <div className="space-y-2 py-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton h-9 w-full" />
                ))}
              </div>
            ) : (
              <ul>
                <FolderRow
                  label="All"
                  active={active === 'all'}
                  onClick={() => setActive('all')}
                />
                <FolderRow
                  label="Unfiled"
                  active={active === 'unfiled'}
                  onClick={() => setActive('unfiled')}
                  onDropBookmark={(bookmarkId) => handleDropOnFolder('unfiled', bookmarkId)}
                />
                {folders.map((folder) =>
                  renamingId === folder.id ? (
                    <li key={folder.id} className="px-1 py-1.5">
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRename(folder.id);
                          if (e.key === 'Escape') setRenamingId(null);
                        }}
                        onBlur={() => handleRename(folder.id)}
                        className="input-field h-9 text-sm"
                      />
                    </li>
                  ) : (
                    <FolderRow
                      key={folder.id}
                      label={folder.name}
                      count={folder.count}
                      active={active === folder.id}
                      onClick={() => setActive(folder.id)}
                      onRename={() => {
                        setRenamingId(folder.id);
                        setRenameValue(folder.name);
                      }}
                      onDelete={() => handleDelete(folder)}
                      onDropBookmark={(bookmarkId) => handleDropOnFolder(folder.id, bookmarkId)}
                    />
                  )
                )}
                {folders.length === 0 && (
                  <li className="px-3 py-2 text-xs text-muted">
                    No folders yet — create one below.
                  </li>
                )}
              </ul>
            )}
          </div>

          <form onSubmit={handleCreateFolder} className="space-y-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name…"
              disabled={creating}
              className="input-field h-10 text-sm"
            />
            <button
              type="submit"
              disabled={creating || !newFolderName.trim()}
              className="btn-primary h-10 w-full"
            >
              {creating ? 'Creating…' : 'New folder'}
            </button>
          </form>
        </div>

        <div className="signal-enter space-y-4 lg:col-span-3" style={{ ['--i' as string]: 2 }}>
          <p className="signal-section-title font-mono text-[11px] uppercase tracking-wider text-muted">
            {activeLabel}
          </p>

          {error ? (
            <div className="border-y border-dashed border-border py-16 text-center">
              <p className="text-sm text-red">{error}</p>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="shelf-card space-y-3 p-4">
                  <div className="flex gap-3">
                    <div className="skeleton size-5 shrink-0" />
                    <div className="skeleton h-4 flex-1" />
                  </div>
                  <div className="skeleton h-3 w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <BookmarkGrid
              bookmarks={bookmarks}
              category={active}
              dragEnabled
              emptyMessage={
                active === 'all'
                  ? undefined
                  : active === 'unfiled'
                    ? 'Nothing unfiled — every bookmark is in a folder.'
                    : `No bookmarks in "${activeLabel}" yet.`
              }
              onDeleted={(id) => setBookmarks((prev) => prev.filter((b) => b.id !== id))}
              onUpdated={(bookmark) =>
                setBookmarks((prev) =>
                  prev.map((b) => (b.id === bookmark.id ? bookmark : b))
                )
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

function FolderRow({
  label,
  count,
  active,
  onClick,
  onRename,
  onDelete,
  onDropBookmark,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onDropBookmark?: (bookmarkId: string) => void;
}) {
  const [isOver, setIsOver] = useState(false);
  const dragDepth = useRef(0);

  return (
    <li
      className={`forge-row group relative flex min-h-11 items-center gap-2 rounded-[10px] pl-3 pr-1 transition-colors ${
        isOver ? 'bg-surface-hover ring-2 ring-accent' : ''
      }`}
      onDragOver={
        onDropBookmark
          ? (e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }
          : undefined
      }
      onDragEnter={
        onDropBookmark
          ? (e) => {
              e.preventDefault();
              dragDepth.current += 1;
              setIsOver(true);
            }
          : undefined
      }
      onDragLeave={
        onDropBookmark
          ? () => {
              dragDepth.current -= 1;
              if (dragDepth.current <= 0) {
                dragDepth.current = 0;
                setIsOver(false);
              }
            }
          : undefined
      }
      onDrop={
        onDropBookmark
          ? (e) => {
              e.preventDefault();
              dragDepth.current = 0;
              setIsOver(false);
              const bookmarkId = e.dataTransfer.getData('text/plain');
              if (bookmarkId) onDropBookmark(bookmarkId);
            }
          : undefined
      }
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-accent"
          aria-hidden
        />
      )}
      <button
        type="button"
        onClick={onClick}
        className={`min-w-0 flex-1 truncate py-2 text-left text-sm transition-colors ${
          active ? 'font-medium text-accent' : 'text-muted group-hover:text-fg'
        }`}
      >
        {label}
      </button>
      <div className="flex shrink-0 items-center gap-0.5">
        {typeof count === 'number' && (
          <span className="mr-1 font-mono text-[11px] tabular-nums text-muted">{count}</span>
        )}
        {onRename && (
          <button
            type="button"
            onClick={onRename}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center text-muted opacity-100 transition-opacity hover:text-fg sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
            aria-label={`Rename ${label}`}
            title="Rename"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center text-muted opacity-100 transition-opacity hover:text-red sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
            aria-label={`Delete ${label}`}
            title="Delete"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
          </button>
        )}
      </div>
    </li>
  );
}
