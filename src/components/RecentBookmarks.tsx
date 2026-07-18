'use client';

import Link from 'next/link';
import { Bookmark } from '@/types';

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }
}

export default function RecentBookmarks({
  bookmarks,
  subtitle = 'Last 7 days',
}: {
  bookmarks: Bookmark[];
  subtitle?: string;
}) {
  return (
    <section>
      <div className="forge-section-title flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-fg">Recent</h2>
          <p className="mt-1 font-mono text-[11px] text-muted">{subtitle}</p>
        </div>
        <Link
          href="/bookmarks"
          className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-muted transition-colors hover:text-accent"
        >
          View all →
        </Link>
      </div>

      {bookmarks.length === 0 ? (
        <div className="mt-6 rounded-[10px] border border-dashed border-border py-12 text-center">
          <p className="text-sm text-muted">No bookmarks yet.</p>
          <Link
            href="/add"
            className="mt-3 inline-block font-mono text-[11px] uppercase tracking-wider text-accent transition-colors hover:text-fg"
          >
            Add a bookmark →
          </Link>
        </div>
      ) : (
        <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {bookmarks.map((bookmark, i) => (
            <li
              key={bookmark.id}
              className="signal-enter"
              style={{ ['--i' as string]: Math.min(i, 8) }}
            >
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shelf-card group flex h-full flex-col p-4"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={bookmark.favicon}
                    alt=""
                    className="mt-0.5 size-6 shrink-0 rounded-md opacity-90"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Crect fill='%23808080' fill-opacity='0.25' width='24' height='24' rx='4'/%3E%3C/svg%3E";
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 font-display text-lg font-bold tracking-tight text-fg transition-colors group-hover:text-accent">
                      {bookmark.isFavorite && (
                        <span className="mr-1.5 text-accent" title="Favorite">
                          ★
                        </span>
                      )}
                      {bookmark.title}
                    </p>
                    <p className="mt-2 truncate font-mono text-[11px] text-muted">
                      {domainOf(bookmark.url)}
                      <span className="mx-1.5 text-muted/45" aria-hidden>
                        ·
                      </span>
                      {formatRelative(bookmark.createdAt)}
                    </p>
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function formatRelative(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
