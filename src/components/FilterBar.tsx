'use client';

import { useEffect, useState } from 'react';
import type { Tag } from '@/types';
import { formatTagLabel } from '@/lib/tag-colors';

export default function FilterBar({
  active,
  onChange,
}: {
  active: string;
  onChange: (tag: string) => void;
}) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tags')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Tag[]) => setTags(data))
      .catch(() => setTags([]))
      .finally(() => setLoading(false));
  }, []);

  const items = [{ name: 'all', count: 0 }, ...tags];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      {loading && tags.length === 0 ? (
        Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-8 w-16 shrink-0 rounded-lg" />
        ))
      ) : (
        items.map((tag) => {
          const id = tag.name;
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`whitespace-nowrap rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-accent/15 text-accent'
                  : 'text-muted hover:bg-surface-hover hover:text-fg'
              }`}
            >
              {id === 'all' ? 'All' : formatTagLabel(tag.name)}
              {id !== 'all' && (
                <span className="ml-1.5 text-xs opacity-60">{tag.count}</span>
              )}
            </button>
          );
        })
      )}
    </div>
  );
}
