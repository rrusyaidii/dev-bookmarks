'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BookmarkFormFields, { type BookmarkFormValues } from './BookmarkFormFields';
import { formatTagLabel } from '@/lib/tag-colors';

export default function AddBookmarkForm() {
  const router = useRouter();
  const [values, setValues] = useState<BookmarkFormValues>({
    url: '',
    title: '',
    description: '',
    tags: [],
    folders: [],
    notes: '',
  });
  const [favicon, setFavicon] = useState('');
  const [fetchingMeta, setFetchingMeta] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<{ id: string; title: string } | null>(null);

  const patch = useCallback((p: Partial<BookmarkFormValues>) => {
    setValues((prev) => ({ ...prev, ...p }));
  }, []);

  const checkDuplicate = useCallback(async (url: string) => {
    if (!url.match(/^https?:\/\/.+/)) {
      setDuplicate(null);
      return;
    }
    try {
      const res = await fetch(`/api/bookmarks/exists?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.exists && data.id) {
        setDuplicate({ id: data.id, title: data.title || 'Existing bookmark' });
      } else {
        setDuplicate(null);
      }
    } catch {
      setDuplicate(null);
    }
  }, []);

  const handleUrlBlur = useCallback(async () => {
    const trimmed = values.url.trim();
    if (!trimmed || !trimmed.match(/^https?:\/\/.+/)) return;

    await checkDuplicate(trimmed);

    setFetchingMeta(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookmarks/metadata?url=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch page metadata');
      setValues((prev) => ({
        ...prev,
        title: prev.title || data.title || '',
        description: prev.description || data.description || '',
      }));
      setFavicon(data.favicon || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch preview');
    } finally {
      setFetchingMeta(false);
    }
  }, [values.url, checkDuplicate]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (duplicate) {
        setError('This URL is already bookmarked.');
        return;
      }
      setSaving(true);
      setError(null);

      try {
        const res = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: values.url,
            title: values.title || undefined,
            description: values.description || undefined,
            favicon: favicon || undefined,
            tags: values.tags,
            folders: values.folders,
            notes: values.notes || undefined,
          }),
        });

        const data = await res.json();
        if (res.status === 409) {
          setDuplicate({ id: data.id, title: 'Existing bookmark' });
          throw new Error(data.error || 'URL already exists');
        }
        if (!res.ok) throw new Error(data.error || 'Failed to save bookmark');

        router.push('/bookmarks');
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
        setSaving(false);
      }
    },
    [values, favicon, duplicate, router]
  );

  const previewReady = Boolean(values.url.match(/^https?:\/\/.+/));

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-3">
        <BookmarkFormFields
          values={values}
          onChange={(p) => {
            patch(p);
            if (p.url !== undefined) setDuplicate(null);
          }}
          onUrlBlur={handleUrlBlur}
          disabled={saving || fetchingMeta}
          urlHint={
            <>
              {fetchingMeta && (
                <p className="mt-1.5 font-mono text-[11px] text-muted">
                  Fetching page metadata…
                </p>
              )}
              {duplicate && (
                <p className="mt-1.5 text-xs text-accent">
                  Already saved as &quot;{duplicate.title}&quot;.{' '}
                  <Link href="/bookmarks" className="underline hover:text-fg">
                    View bookmarks
                  </Link>
                </p>
              )}
            </>
          }
        />

        {error && <p className="text-sm text-red">{error}</p>}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || fetchingMeta || Boolean(duplicate)}
            className="btn-primary"
          >
            {saving ? 'Saving…' : 'Save bookmark'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={saving}
            className="btn-ghost"
          >
            Cancel
          </button>
        </div>
        <p className="font-mono text-[11px] text-muted">
          Leave tags empty to let AI suggest them on save.
        </p>
      </form>

      <div className="lg:col-span-2">
        <p className="forge-section-title mb-4 font-mono text-[11px] uppercase tracking-wider text-muted">
          Preview
        </p>
        {previewReady ? (
          <div className="shelf-card p-4">
            <div className="flex items-start gap-3">
              <img
                src={
                  favicon ||
                  `https://www.google.com/s2/favicons?domain=${new URL(values.url).hostname}&sz=64`
                }
                alt=""
                className="size-7 shrink-0 rounded-md bg-bg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Crect fill='%23808080' fill-opacity='0.25' width='28' height='28'/%3E%3C/svg%3E";
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-fg">
                  {values.title || (fetchingMeta ? 'Loading…' : 'Untitled')}
                </p>
                <p className="mt-0.5 truncate font-mono text-[11px] text-muted">
                  {values.url.replace(/^https?:\/\//, '').replace(/\/$/, '') || '—'}
                </p>
              </div>
            </div>
            <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted">
              {values.description ||
                (fetchingMeta ? 'Fetching page metadata…' : 'No description yet.')}
            </p>
            {values.notes && (
              <p className="mt-2 font-mono text-[11px] text-muted">Note · {values.notes}</p>
            )}
            {values.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
                {values.tags.map((tag) => (
                  <span key={tag} className="font-mono text-[11px] text-muted">
                    {formatTagLabel(tag)}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-[10px] border border-dashed border-border py-16 text-center">
            <p className="font-mono text-[11px] text-muted">Enter a URL to see a preview</p>
          </div>
        )}
      </div>
    </div>
  );
}
