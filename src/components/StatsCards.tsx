'use client';

import { Stats } from '@/types';
import { useEffect, useState } from 'react';

function useCountUp(target: number, duration = 400) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced || !Number.isFinite(target)) {
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) * (1 - t);
      setValue(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

export default function StatsCards({ stats }: { stats: Stats }) {
  const total = useCountUp(stats.total);
  const week = useCountUp(stats.savedThisWeek);
  const favs = useCountUp(stats.favorites ?? 0);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div
        className="signal-enter shelf-card col-span-1 flex flex-col justify-between p-5 sm:col-span-2 lg:col-span-2 lg:row-span-1 min-h-[140px]"
        style={{ ['--i' as string]: 0 }}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Total</p>
        <p className="mt-4 font-display text-6xl font-bold tracking-tight text-fg tabular-nums">
          {total}
        </p>
        <p className="mt-2 text-sm text-muted">links on your shelf</p>
      </div>

      <div
        className="signal-enter shelf-card p-5"
        style={{ ['--i' as string]: 1 }}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">This week</p>
        <p className="mt-3 font-display text-4xl font-bold tabular-nums text-fg">{week}</p>
      </div>

      <div
        className="signal-enter shelf-card p-5"
        style={{ ['--i' as string]: 2 }}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Favorites</p>
        <p className="mt-3 font-display text-4xl font-bold tabular-nums text-fg">{favs}</p>
      </div>

      <div
        className="signal-enter shelf-card p-5 sm:col-span-2 lg:col-span-2"
        style={{ ['--i' as string]: 3 }}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Top tag</p>
        <p className="mt-3 font-display text-3xl font-bold tracking-tight text-accent">
          {stats.mostUsedTag}
        </p>
      </div>
    </div>
  );
}
