'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Bookmark, SortKey } from '@/types';
import FilterBar from '@/components/FilterBar';
import BookmarkGrid from '@/components/BookmarkGrid';
import ViewToggle from '@/components/ViewToggle';
import { sortBookmarks } from '@/lib/serialize-bookmark';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'az', label: 'A–Z' },
  { value: 'tagCount', label: 'Tag count' },
  { value: 'favorites', label: 'Favorites first' },
];

function BookmarksPageInner() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const initialTag = searchParams.get('tag') || 'all';
  const [activeTag, setActiveTag] = useState(initialTag);
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [sort, setSort] = useState<SortKey>('newest');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tag = searchParams.get('tag');
    if (tag) setActiveTag(tag);
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/bookmarks')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load bookmarks');
        return res.json();
      })
      .then((data: Bookmark[]) => {
        setBookmarks(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const results = useMemo(() => {
    let filtered = bookmarks;
    if (activeTag !== 'all') {
      filtered = filtered.filter((b) =>
        b.tags.some((t) => t.toLowerCase() === activeTag.toLowerCase())
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.url.toLowerCase().includes(q) ||
          (b.notes || '').toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return sortBookmarks(filtered, sort);
  }, [activeTag, searchQuery, bookmarks, sort]);

  const isFiltered = activeTag !== 'all' || Boolean(searchQuery.trim());
  const countLabel = loading
    ? 'Loading…'
    : isFiltered
      ? `${results.length} of ${bookmarks.length}`
      : `${bookmarks.length} collected`;

  return (
    <div className="mx-auto max-w-3xl space-y-8 xl:max-w-5xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="forge-enter" style={{ ['--i' as string]: 0 }}>
          <h1 className="font-display text-4xl font-bold tracking-tight text-fg">
            Bookmarks
          </h1>
          <p className="mt-2 font-mono text-xs tabular-nums text-muted">{countLabel}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <ViewToggle />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            disabled={loading}
            className="h-10 rounded-[10px] border border-border bg-bg px-3 font-mono text-xs text-fg outline-none focus-visible:border-accent disabled:opacity-50"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-56">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search…"
              disabled={loading}
              className="h-10 w-full rounded-[10px] border border-border bg-bg pl-9 pr-3 text-sm text-fg placeholder-muted outline-none focus-visible:border-accent disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      <div className="forge-enter space-y-6" style={{ ['--i' as string]: 1 }}>
        <FilterBar active={activeTag} onChange={setActiveTag} />

        {error ? (
          <div className="border-y border-dashed border-border py-16 text-center">
            <p className="text-sm text-red">{error}</p>
            <p className="mt-2 text-sm text-muted">Could not load bookmarks.</p>
          </div>
        ) : (
          <BookmarkGrid
            bookmarks={results}
            category={activeTag}
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

export default function BookmarksPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="skeleton h-8 w-40" />
          <div className="skeleton h-64 w-full" />
        </div>
      }
    >
      <BookmarksPageInner />
    </Suspense>
  );
}
