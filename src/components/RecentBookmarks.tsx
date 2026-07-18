'use client';

import { Bookmark } from '@/types';
import { formatTagLabel } from '@/lib/tag-colors';

export default function RecentBookmarks({ bookmarks }: { bookmarks: Bookmark[] }) {
  if (bookmarks.length === 0) {
    return (
      <section>
        <h2 className="font-display text-xl font-medium text-fg">Recent</h2>
        <div className="mt-4 border border-dashed border-border px-4 py-12 text-center">
          <p className="text-sm text-muted">No bookmarks yet. Add your first one.</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="font-display text-xl font-medium text-fg">Recent</h2>
      <ul className="mt-4 divide-y divide-border border border-border">
        {bookmarks.map((bookmark) => (
          <li key={bookmark.id}>
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-surface"
            >
              <img
                src={bookmark.favicon}
                alt=""
                className="size-7 shrink-0 border border-border bg-surface"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Crect fill='%231c1917' width='28' height='28'/%3E%3C/svg%3E";
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-fg group-hover:text-accent">
                  {bookmark.isFavorite && (
                    <span className="mr-1.5 text-accent" title="Favorite">
                      ★
                    </span>
                  )}
                  {bookmark.title}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {bookmark.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="font-mono text-[11px] text-muted">
                      {formatTagLabel(tag)}
                    </span>
                  ))}
                  {bookmark.tags.length > 2 && (
                    <span className="font-mono text-[11px] text-muted">
                      +{bookmark.tags.length - 2}
                    </span>
                  )}
                </div>
              </div>
              <time
                className="shrink-0 font-mono text-[11px] text-muted"
                dateTime={bookmark.createdAt}
              >
                {formatDate(bookmark.createdAt)}
              </time>
            </a>
          </li>
        ))}
      </ul>
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
