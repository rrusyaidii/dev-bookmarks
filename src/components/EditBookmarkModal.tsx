'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Bookmark } from '@/types';
import BookmarkFormFields, { type BookmarkFormValues } from './BookmarkFormFields';

export default function EditBookmarkModal({
  bookmark,
  open,
  onClose,
  onSaved,
}: {
  bookmark: Bookmark | null;
  open: boolean;
  onClose: () => void;
  onSaved: (bookmark: Bookmark) => void;
}) {
  const [values, setValues] = useState<BookmarkFormValues>({
    url: '',
    title: '',
    description: '',
    tags: [],
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [retagging, setRetagging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookmark && open) {
      setValues({
        url: bookmark.url,
        title: bookmark.title,
        description: bookmark.description,
        tags: bookmark.tags,
        notes: bookmark.notes || '',
      });
      setError(null);
    }
  }, [bookmark, open]);

  const patch = useCallback((p: Partial<BookmarkFormValues>) => {
    setValues((prev) => ({ ...prev, ...p }));
  }, []);

  const handleSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!bookmark) return;
      setSaving(true);
      setError(null);
      try {
        const res = await fetch(`/api/bookmarks/${bookmark.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update');
        onSaved(data);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update');
      } finally {
        setSaving(false);
      }
    },
    [bookmark, values, onSaved, onClose]
  );

  const handleRetag = useCallback(async () => {
    if (!bookmark) return;
    setRetagging(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookmarks/${bookmark.id}/retag`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to retag');
      setValues((prev) => ({ ...prev, tags: data.tags }));
      onSaved(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retag');
    } finally {
      setRetagging(false);
    }
  }, [bookmark, onSaved]);

  if (!open || !bookmark) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-fg">Edit bookmark</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-surface-hover hover:text-fg"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <BookmarkFormFields
            values={values}
            onChange={patch}
            disabled={saving || retagging}
          />

          {error && <p className="text-sm text-red">{error}</p>}

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={saving || retagging}
              className="h-10 rounded-xl bg-accent/15 px-5 text-sm font-semibold text-accent hover:bg-accent/25 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleRetag}
              disabled={saving || retagging}
              className="h-10 rounded-xl border border-border px-5 text-sm font-medium text-muted hover:bg-surface-hover hover:text-fg disabled:opacity-50"
            >
              {retagging ? 'Retagging…' : 'Retag with AI'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-10 rounded-xl px-5 text-sm text-muted hover:text-fg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
