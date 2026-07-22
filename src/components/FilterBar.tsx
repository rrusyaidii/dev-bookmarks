'use client';

import { useEffect, useState, memo, useCallback } from 'react';
import type { Tag } from '@/types';
import { formatTagLabel } from '@/lib/tag-colors';

const FilterBar = memo(function FilterBar({
  active,
  onChange,
}: {
  active: string;
  onChange: (tag: string) => void;
}) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/tags', { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Tag[]) => setTags(data))
      .catch(() => setTags([]))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  return (
    <div className="forge-filter-scroll -mx-1 overflow-x-auto px-1">
      <div className="flex min-w-min items-stretch gap-4 border-b border-border pb-px">
        {loading && tags.length === 0 ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton mb-2 h-8 w-14 shrink-0" />
          ))
        ) : (
          <>
            <FilterTab
              label="All"
              active={active === 'all'}
              onClick={() => onChange('all')}
              all
            />
            {tags.map((tag) => (
              <FilterTab
                key={tag.name}
                label={formatTagLabel(tag.name)}
                count={tag.count}
                active={active === tag.name}
                onClick={() => onChange(tag.name)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
});

export default FilterBar;

const FilterTab = memo(function FilterTab({
  label,
  count,
  active,
  onClick,
  all,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  all?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex min-h-10 shrink-0 cursor-pointer items-center gap-2 border-b-2 px-0.5 pb-2 pt-1 transition-colors duration-200 ${
        active
          ? 'border-accent text-accent'
          : 'border-transparent text-muted hover:text-fg'
      }`}
    >
      <span
        className={
          all
            ? 'font-mono text-[11px] uppercase tracking-[0.14em]'
            : 'text-sm font-medium tracking-tight'
        }
      >
        {label}
      </span>
      {typeof count === 'number' && (
        <>
          <span className="select-none text-muted/40" aria-hidden>
            ·
          </span>
          <span className="font-mono text-[11px] tabular-nums text-muted">
            {count}
          </span>
        </>
      )}
    </button>
  );
});
