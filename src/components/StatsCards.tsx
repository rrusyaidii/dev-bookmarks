'use client';

import { Stats } from '@/types';
import { useEffect, useState } from 'react';

function SkeletonCard() {
  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <div className="skeleton h-4 w-20" />
      <div className="skeleton h-8 w-24" />
    </div>
  );
}

export default function StatsCards({ stats }: { stats: Stats }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Bookmarks',
      value: stats.total,
      icon: BookmarkIcon,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      label: 'Saved This Week',
      value: stats.savedThisWeek,
      icon: ClockIcon,
      color: 'text-green',
      bg: 'bg-green/10',
    },
    {
      label: 'Favorites',
      value: stats.favorites ?? 0,
      icon: StarIcon,
      color: 'text-yellow',
      bg: 'bg-yellow/10',
    },
    {
      label: 'Most Used Tag',
      value: stats.mostUsedTag,
      icon: TagIcon,
      color: 'text-purple',
      bg: 'bg-purple/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="glass rounded-xl p-4 transition-all duration-200 hover:scale-[1.02] hover:border-border/80"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted">
                {card.label}
              </p>
              <p className="mt-1.5 text-2xl font-bold text-fg">
                {card.value}
              </p>
            </div>
            <div className={`rounded-lg p-2.5 ${card.bg}`}>
              <card.icon className={`size-5 ${card.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
      <path d="M9 2v5l3-2 3 2V2" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2z" />
      <circle cx="7" cy="7" r="1.5" fill="currentColor" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
