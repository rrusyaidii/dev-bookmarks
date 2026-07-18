'use client';

import StatsCards from '@/components/StatsCards';
import RecentBookmarks from '@/components/RecentBookmarks';
import QuickAddButton from '@/components/QuickAddButton';
import { Bookmark } from '@/types';
import { useEffect, useState } from 'react';
import { formatTagLabel } from '@/lib/tag-colors';

export default function DashboardPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-10">
        <div>
          <div className="skeleton h-8 w-40" />
          <div className="skeleton mt-2 h-4 w-56" />
        </div>
        <div className="grid grid-cols-2 gap-px border border-border bg-border lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface px-4 py-5 space-y-3">
              <div className="skeleton h-3 w-16" />
              <div className="skeleton h-8 w-12" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="font-display text-3xl font-medium text-fg">Dashboard</h1>
        <p className="text-sm text-red">{error}</p>
        <p className="text-sm text-muted">Could not load bookmarks.</p>
      </div>
    );
  }

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentBookmarks = bookmarks
    .filter((b) => new Date(b.createdAt) >= oneWeekAgo)
    .slice(0, 6);

  const tagCounts = bookmarks.flatMap((b) => b.tags).reduce<Record<string, number>>(
    (acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    },
    {}
  );
  const topTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const mostUsedTag = topTag ? formatTagLabel(topTag) : '—';
  const favorites = bookmarks.filter((b) => b.isFavorite).length;

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight text-fg">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-muted">Your collection at a glance.</p>
      </div>

      <StatsCards
        stats={{
          total: bookmarks.length,
          savedThisWeek: recentBookmarks.length,
          mostUsedTag,
          favorites,
        }}
      />
      <RecentBookmarks bookmarks={recentBookmarks} />
      <QuickAddButton />
    </div>
  );
}
