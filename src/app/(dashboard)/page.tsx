'use client';

import StatsCards from '@/components/StatsCards';
import RecentBookmarks from '@/components/RecentBookmarks';
import QuickAddButton from '@/components/QuickAddButton';
import { Bookmark } from '@/types';
import { useEffect, useState } from 'react';

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
      <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-fg">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Your bookmark overview at a glance.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-xl p-4 space-y-3">
              <div className="skeleton h-4 w-20" />
              <div className="skeleton h-8 w-24" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <div className="skeleton h-5 w-40" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl p-3">
              <div className="skeleton size-8 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton h-4 w-3/5" />
                <div className="skeleton h-3 w-2/5" />
              </div>
              <div className="skeleton h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl space-y-8">
        <h1 className="text-2xl font-bold tracking-tight text-fg">Dashboard</h1>
        <div className="flex flex-col items-center gap-4 rounded-xl py-24 text-center">
          <p className="text-red text-sm">{error}</p>
          <p className="text-muted text-sm">Could not load bookmarks. Make sure the server is running.</p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentBookmarks = bookmarks.filter(
    (b) => new Date(b.createdAt) >= oneWeekAgo
  ).slice(0, 6);

  const tagCounts = bookmarks.flatMap((b) => b.tags).reduce<Record<string, number>>(
    (acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    },
    {}
  );
  const mostUsedTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  const favorites = bookmarks.filter((b) => b.isFavorite).length;

  const stats = {
    total: bookmarks.length,
    savedThisWeek: recentBookmarks.length,
    mostUsedTag,
    favorites,
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-fg">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Your bookmark overview at a glance.</p>
      </div>

      <StatsCards stats={stats} />
      <RecentBookmarks bookmarks={recentBookmarks} />
      <QuickAddButton />
    </div>
  );
}
