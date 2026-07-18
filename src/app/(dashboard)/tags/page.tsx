'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Tag } from '@/types';
import { formatTagLabel, getTagColor } from '@/lib/tag-colors';

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/tags')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load tags');
        return res.json();
      })
      .then((data: Tag[]) => {
        setTags(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-fg">Tags</h1>
        <p className="mt-1 text-sm text-muted">
          {loading ? 'Loading…' : `${tags.length} tags across your collection`}
        </p>
      </div>

      {error && (
        <p className="text-sm text-red">{error}</p>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      ) : tags.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted">No tags yet. Add bookmarks to generate tags.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {tags.map((tag) => {
            const color = tag.color || getTagColor(tag.name);
            return (
              <Link
                key={tag.name}
                href={`/bookmarks?tag=${encodeURIComponent(tag.name)}`}
                className="glass rounded-xl p-4 transition-all hover:scale-[1.02] hover:border-border/80"
              >
                <span
                  className="inline-flex rounded-md px-2 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {formatTagLabel(tag.name)}
                </span>
                <p className="mt-3 text-2xl font-bold text-fg">{tag.count}</p>
                <p className="text-xs text-muted">
                  {tag.count === 1 ? 'bookmark' : 'bookmarks'}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
