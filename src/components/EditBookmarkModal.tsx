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
      <div className="absolute inset-0 bg-bg/85" onClick={onClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto border border-border bg-surface p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-medium text-fg">Edit bookmark</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 cursor-pointer items-center justify-center text-muted transition-colors hover:text-fg"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <BookmarkFormFields
            values={values}
            onChange={patch}
            disabled={saving || retagging}
          />

          {error && <p className="text-sm text-red">{error}</p>}

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button type="submit" disabled={saving || retagging} className="btn-primary">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleRetag}
              disabled={saving || retagging}
              className="btn-ghost"
            >
              {retagging ? 'Retagging…' : 'Retag with AI'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="min-h-11 cursor-pointer px-4 text-sm text-muted transition-colors hover:text-fg disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
