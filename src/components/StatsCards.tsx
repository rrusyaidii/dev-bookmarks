'use client';

import { Stats } from '@/types';

export default function StatsCards({ stats }: { stats: Stats }) {
  const cards = [
    { label: 'Total', value: String(stats.total) },
    { label: 'This week', value: String(stats.savedThisWeek) },
    { label: 'Favorites', value: String(stats.favorites ?? 0) },
    { label: 'Top tag', value: stats.mostUsedTag },
  ];

  return (
    <div className="grid grid-cols-2 gap-px border border-border bg-border lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-surface px-4 py-5">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
            {card.label}
          </p>
          <p className="mt-2 font-display text-3xl font-medium tracking-tight text-fg">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
