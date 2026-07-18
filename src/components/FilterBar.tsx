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
    <div className="flex items-center gap-1 overflow-x-auto border-b border-border pb-px scrollbar-none">
      {loading && tags.length === 0 ? (
        Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-9 w-16 shrink-0" />
        ))
      ) : (
        items.map((tag) => {
          const id = tag.name;
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`min-h-10 shrink-0 cursor-pointer border-b-2 px-3 py-2 font-mono text-xs transition-colors duration-200 ${
                isActive
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted hover:text-fg'
              }`}
            >
              {id === 'all' ? 'All' : formatTagLabel(tag.name)}
              {id !== 'all' && (
                <span className="ml-1.5 opacity-50">{tag.count}</span>
              )}
            </button>
          );
        })
      )}
    </div>
  );
}
