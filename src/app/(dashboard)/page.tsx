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
      <div className="mx-auto max-w-4xl space-y-10">
        <div>
          <div className="skeleton h-10 w-48" />
          <div className="skeleton mt-2 h-4 w-56" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="shelf-card col-span-2 min-h-[140px] p-5">
            <div className="skeleton h-3 w-16" />
            <div className="skeleton mt-6 h-14 w-24" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="shelf-card p-5">
              <div className="skeleton h-3 w-16" />
              <div className="skeleton mt-4 h-10 w-12" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="font-display text-3xl font-bold text-fg sm:text-4xl">Dashboard</h1>
        <p className="text-sm text-red">{error}</p>
        <p className="text-sm text-muted">Could not load bookmarks.</p>
      </div>
    );
  }

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const newestFirst = [...bookmarks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const thisWeek = newestFirst.filter((b) => new Date(b.createdAt) >= oneWeekAgo);
  const savedThisWeek = thisWeek.length;
  const recentBookmarks = (thisWeek.length > 0 ? thisWeek : newestFirst).slice(0, 6);
  const recentSubtitle =
    thisWeek.length > 0 ? 'Last 7 days' : bookmarks.length > 0 ? 'Latest saves' : 'Last 7 days';

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
    <div className="mx-auto max-w-4xl space-y-10">
      <div className="signal-enter" style={{ ['--i' as string]: 0 }}>
        <h1 className="font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-muted">Your signal shelf at a glance.</p>
      </div>

      <StatsCards
        stats={{
          total: bookmarks.length,
          savedThisWeek,
          mostUsedTag,
          favorites,
        }}
      />
      <div className="forge-enter" style={{ ['--i' as string]: 2 }}>
        <RecentBookmarks bookmarks={recentBookmarks} subtitle={recentSubtitle} />
      </div>
      <QuickAddButton />
    </div>
  );
}
