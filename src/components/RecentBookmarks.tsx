'use client';

import { Bookmark } from '@/types';
import { useEffect, useState } from 'react';

function SkeletonRows() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl p-3">
          <div className="skeleton size-8 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-1.5 min-w-0">
            <div className="skeleton h-4 w-3/5" />
            <div className="skeleton h-3 w-2/5" />
          </div>
          <div className="skeleton h-4 w-16 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export default function RecentBookmarks({ bookmarks }: { bookmarks: Bookmark[] }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <section>
        <h2 className="mb-4 text-lg font-semibold text-fg">Recent Bookmarks</h2>
        <SkeletonRows />
      </section>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <section>
        <h2 className="mb-4 text-lg font-semibold text-fg">Recent Bookmarks</h2>
        <div className="flex flex-col items-center gap-3 rounded-xl py-12 text-center">
          <p className="text-sm text-muted">No bookmarks yet. Add your first one!</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-fg">Recent Bookmarks</h2>
      <div className="space-y-1">
        {bookmarks.map((bookmark, i) => (
          <a
            key={bookmark.id}
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-xl px-3 py-2.5 transition-all hover:bg-surface-hover"
            style={{ animationDelay: `${i * 60}ms` }}
          >
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
              <p className="truncate text-sm font-medium text-fg group-hover:text-accent transition-colors">
                {bookmark.isFavorite && (
                  <span className="mr-1 text-yellow" title="Favorite">★</span>
                )}
                {bookmark.title}
              </p>
              <div className="mt-1 flex items-center gap-2">
                {bookmark.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] font-medium text-muted"
                  >
                    {tag}
                  </span>
                ))}
                {bookmark.tags.length > 2 && (
                  <span className="text-xs text-muted">+{bookmark.tags.length - 2}</span>
                )}
              </div>
            </div>

            <time className="shrink-0 text-xs text-muted" dateTime={bookmark.createdAt}>
              {formatDate(bookmark.createdAt)}
            </time>
          </a>
        ))}
      </div>
    </section>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
