'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Tag } from '@/types';
import { formatTagLabel } from '@/lib/tag-colors';

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/tags', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load tags');
        return res.json();
      })
      .then((data: Tag[]) => {
        setTags(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="signal-enter" style={{ ['--i' as string]: 0 }}>
        <h1 className="font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">Tags</h1>
        <p className="mt-2 font-mono text-xs text-muted">
          {loading ? 'Loading…' : `${tags.length} in your collection`}
        </p>
      </div>

      {error && <p className="text-sm text-red">{error}</p>}

      {loading ? (
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-4">
              <div className="skeleton h-4 w-28" />
              <div className="skeleton h-4 w-8" />
            </div>
          ))}
        </div>
      ) : tags.length === 0 ? (
        <div className="border-y border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted">No tags yet. Add bookmarks to generate tags.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {tags.map((tag, i) => (
            <li key={tag.name}>
              <Link
                href={`/bookmarks?tag=${encodeURIComponent(tag.name)}`}
                className="forge-row forge-enter flex items-center justify-between gap-4 px-3 py-4"
                style={{ ['--i' as string]: Math.min(i, 12) }}
              >
                <span className="text-sm font-medium text-fg transition-colors hover:text-accent">
                  {formatTagLabel(tag.name)}
                </span>
                <span className="font-mono text-xs text-muted">{tag.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
