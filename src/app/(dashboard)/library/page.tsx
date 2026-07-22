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
  const [addingFolder, setAddingFolder] = useState(false);
  const [creating, setCreating] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const cancelingRenameRef = useRef(false);
  const cancelingCreateRef = useRef(false);

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
    const params = new URLSearchParams();
    if (active !== 'all') params.set('folder', active);

    const controller = new AbortController();
    fetch(`/api/bookmarks?${params.toString()}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load bookmarks');
        return res.json();
      })
      .then((response: { data: Bookmark[] } | Bookmark[]) => {
        const data = Array.isArray(response) ? response : response.data || [];
        setBookmarks(data);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err instanceof Error ? err.message : 'Failed to load');
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [active]);

  const handleCreateFolder = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const name = newFolderName.trim();
      if (!name) {
        setAddingFolder(false);
        return;
      }
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
        setAddingFolder(false);
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
        const activeFolder = folders.find((f) => f.id === active);
        newNames = activeFolder
          ? currentNames.filter((n) => n !== activeFolder.name)
          : [];
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

  const allCount = active === 'all' && !loading ? bookmarks.length : undefined;
  const unfiledCount = active === 'unfiled' && !loading ? bookmarks.length : undefined;

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div className="signal-enter" style={{ ['--i' as string]: 0 }}>
        <h1 className="font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">
          Library
        </h1>
        <p className="mt-2 font-mono text-xs text-muted">Bookmarks organized into folders.</p>
      </div>

      <div
        className="signal-enter sticky top-14 z-10 space-y-3 border-b border-border bg-bg pb-5 pt-3"
        style={{ ['--i' as string]: 1 }}
      >
        <div className="flex items-baseline justify-between gap-4">
          <p className="signal-section-title font-mono text-[11px] uppercase tracking-wider text-muted">
            Folders
          </p>
          <p className="hidden text-xs text-muted sm:block">Drag a bookmark onto a folder to file it.</p>
        </div>

        {foldersLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="shelf-card space-y-3 p-4">
                <div className="skeleton size-9 rounded-lg" />
                <div className="skeleton h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <FolderCard
              label="All bookmarks"
              icon="all"
              count={allCount}
              active={active === 'all'}
              onClick={() => setActive('all')}
            />
            <FolderCard
              label="Unfiled"
              icon="unfiled"
              count={unfiledCount}
              active={active === 'unfiled'}
              onClick={() => setActive('unfiled')}
              onDropBookmark={(bookmarkId) => handleDropOnFolder('unfiled', bookmarkId)}
            />
            {folders.map((folder) =>
              renamingId === folder.id ? (
                <div key={folder.id} className="shelf-card p-4">
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(folder.id);
                      if (e.key === 'Escape') {
                        cancelingRenameRef.current = true;
                        setRenamingId(null);
                      }
                    }}
                    onBlur={() => {
                      if (cancelingRenameRef.current) {
                        cancelingRenameRef.current = false;
                        return;
                      }
                      handleRename(folder.id);
                    }}
                    className="input-field h-9 text-sm"
                  />
                </div>
              ) : (
                <FolderCard
                  key={folder.id}
                  label={folder.name}
                  icon="folder"
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

            {addingFolder ? (
              <div className="shelf-card p-4">
                <form onSubmit={handleCreateFolder} className="space-y-2">
                  <input
                    autoFocus
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name…"
                    disabled={creating}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        cancelingCreateRef.current = true;
                        setAddingFolder(false);
                        setNewFolderName('');
                      }
                    }}
                    onBlur={() => {
                      if (cancelingCreateRef.current) {
                        cancelingCreateRef.current = false;
                        return;
                      }
                      if (!newFolderName.trim()) setAddingFolder(false);
                    }}
                    className="input-field h-9 text-sm"
                  />
                </form>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAddingFolder(true)}
                className="flex min-h-[104px] flex-col items-center justify-center gap-2 rounded-[10px] border border-dashed border-border p-4 text-muted transition-colors hover:border-accent hover:text-accent"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span className="text-xs font-medium">New folder</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="signal-enter space-y-4" style={{ ['--i' as string]: 2 }}>
        <p className="signal-section-title font-mono text-[11px] uppercase tracking-wider text-muted">
          {activeLabel}
        </p>

        {error ? (
          <div className="border-y border-dashed border-border py-16 text-center">
            <p className="text-sm text-red">{error}</p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
  );
}

const FOLDER_ICON_PATHS: Record<'all' | 'unfiled' | 'folder', React.ReactNode> = {
  all: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  unfiled: (
    <>
      <path d="M21 8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8z" />
      <path d="M3 8h18" strokeDasharray="2.5 2.5" />
    </>
  ),
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />,
};

function FolderCard({
  label,
  icon,
  count,
  active,
  onClick,
  onRename,
  onDelete,
  onDropBookmark,
}: {
  label: string;
  icon: 'all' | 'unfiled' | 'folder';
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
    <div
      className={`shelf-card group relative p-4 transition-colors ${
        active ? 'border-accent' : ''
      } ${isOver ? 'bg-surface-hover ring-2 ring-accent' : ''}`}
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
      <button type="button" onClick={onClick} className="flex w-full flex-col items-start gap-3 text-left">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
            active ? 'bg-accent text-white' : 'bg-surface-hover text-muted'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            {FOLDER_ICON_PATHS[icon]}
          </svg>
        </span>
        <span className="min-w-0 w-full">
          <span
            className={`block truncate text-sm font-medium ${active ? 'text-accent' : 'text-fg'}`}
          >
            {label}
          </span>
          {typeof count === 'number' && (
            <span className="mt-0.5 block font-mono text-[11px] tabular-nums text-muted">
              {count} {count === 1 ? 'bookmark' : 'bookmarks'}
            </span>
          )}
        </span>
      </button>

      {(onRename || onDelete) && (
        <div className="absolute right-2 top-2 flex items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          {onRename && (
            <button
              type="button"
              onClick={onRename}
              className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-hover hover:text-fg"
              aria-label={`Rename ${label}`}
              title="Rename"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-hover hover:text-red"
              aria-label={`Delete ${label}`}
              title="Delete"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
