'use client';

import { useState, useMemo, useEffect, Suspense, useRef } from 'react';
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
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ);
  const [sort, setSort] = useState<SortKey>('newest');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState(50);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const tag = searchParams.get('tag');
    if (tag) setActiveTag(tag);
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setDisplayLimit(50);
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    setDisplayLimit(50);
  }, [activeTag]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (sort) params.set('sort', sort);

    const controller = new AbortController();
    fetch(`/api/bookmarks?${params.toString()}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load bookmarks');
        return res.json();
      })
      .then((response: { data: Bookmark[] } | Bookmark[]) => {
        const data = Array.isArray(response) ? response : response.data || [];
        setBookmarks(data);
        setError(null);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setBookmarks([]);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [sort]);

  const { results, totalCount } = useMemo(() => {
    let filtered = bookmarks;
    if (activeTag !== 'all') {
      filtered = filtered.filter((b) =>
        b.tags.some((t) => t.toLowerCase() === activeTag.toLowerCase())
      );
    }
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.url.toLowerCase().includes(q) ||
          (b.notes || '').toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    const sorted = sortBookmarks(filtered, sort);
    return { results: sorted.slice(0, displayLimit), totalCount: sorted.length };
  }, [activeTag, debouncedQuery, bookmarks, sort, displayLimit]);

  const isFiltered = activeTag !== 'all' || Boolean(searchQuery.trim());
  const countLabel = loading
    ? 'Loading…'
    : isFiltered
      ? `${totalCount} found`
      : `${bookmarks.length} collected`;

  return (
    <div className="mx-auto max-w-3xl space-y-8 xl:max-w-5xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="forge-enter" style={{ ['--i' as string]: 0 }}>
          <h1 className="font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">
            Bookmarks
          </h1>
          <p className="mt-2 font-mono text-xs tabular-nums text-muted">{countLabel}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <ViewToggle />
          <select
            id="sort-select"
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
              id="search-input"
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
          <>
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
            {displayLimit < totalCount && (
              <div className="flex justify-center pt-8">
                <button
                  onClick={() => setDisplayLimit((prev) => prev + 50)}
                  className="rounded-[10px] border border-border bg-bg px-4 py-2 font-mono text-sm text-fg transition-colors hover:bg-surface-hover"
                >
                  Load more ({results.length} of {totalCount})
                </button>
              </div>
            )}
          </>
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
