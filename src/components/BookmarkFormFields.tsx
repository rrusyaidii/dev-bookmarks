'use client';

import { useCallback, useEffect, useState } from 'react';
import { PRESET_TAGS } from '@/data/mock';
import { formatTagLabel } from '@/lib/tag-colors';

export interface BookmarkFormValues {
  url: string;
  title: string;
  description: string;
  tags: string[];
  folders: string[];
  notes: string;
}

export default function BookmarkFormFields({
  values,
  onChange,
  disabled,
  showUrl = true,
  urlHint,
  onUrlBlur,
}: {
  values: BookmarkFormValues;
  onChange: (patch: Partial<BookmarkFormValues>) => void;
  disabled?: boolean;
  showUrl?: boolean;
  urlHint?: React.ReactNode;
  onUrlBlur?: () => void;
}) {
  const [tagInput, setTagInput] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [knownFolders, setKnownFolders] = useState<string[]>([]);
  const [showFolderMenu, setShowFolderMenu] = useState(false);

  useEffect(() => {
    fetch('/api/folders')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: { name: string }[]) => setKnownFolders(data.map((f) => f.name)))
      .catch(() => {});
  }, []);

  const handleTagInputChange = useCallback(
    (value: string) => {
      setTagInput(value);
      if (value.trim()) {
        const matches = PRESET_TAGS.filter(
          (t) =>
            t.toLowerCase().includes(value.toLowerCase()) &&
            !values.tags.includes(t)
        );
        setTagSuggestions(matches);
        setShowSuggestions(matches.length > 0);
      } else {
        setTagSuggestions([]);
        setShowSuggestions(false);
      }
    },
    [values.tags]
  );

  const addTag = useCallback(
    (tag: string) => {
      if (!values.tags.includes(tag)) {
        onChange({ tags: [...values.tags, tag] });
      }
      setTagInput('');
      setTagSuggestions([]);
      setShowSuggestions(false);
    },
    [values.tags, onChange]
  );

  const removeTag = useCallback(
    (tag: string) => {
      onChange({ tags: values.tags.filter((t) => t !== tag) });
    },
    [values.tags, onChange]
  );

  const toggleFolder = useCallback(
    (folder: string) => {
      onChange({
        folders: values.folders.includes(folder)
          ? values.folders.filter((f) => f !== folder)
          : [...values.folders, folder],
      });
    },
    [values.folders, onChange]
  );

  const removeFolder = useCallback(
    (folder: string) => {
      onChange({ folders: values.folders.filter((f) => f !== folder) });
    },
    [values.folders, onChange]
  );

  return (
    <div className="space-y-5">
      {showUrl && (
        <div>
          <label htmlFor="bf-url" className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted">
            URL
          </label>
          <input
            id="bf-url"
            type="url"
            value={values.url}
            onChange={(e) => onChange({ url: e.target.value })}
            onBlur={onUrlBlur}
            required
            disabled={disabled}
            className="input-field h-11 font-mono text-xs"
          />
          {urlHint}
        </div>
      )}

      <div>
        <label htmlFor="bf-title" className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted">
          Title
        </label>
        <input
          id="bf-title"
          type="text"
          value={values.title}
          onChange={(e) => onChange({ title: e.target.value })}
          disabled={disabled}
          className="input-field h-11"
        />
      </div>

      <div>
        <label htmlFor="bf-desc" className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted">
          Description
        </label>
        <textarea
          id="bf-desc"
          value={values.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
          disabled={disabled}
          className="input-field resize-none"
        />
      </div>

      <div className="relative">
        <label htmlFor="bf-tags" className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted">
          Tags
        </label>
        <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-[10px] border border-border bg-bg px-3 py-1.5 focus-within:border-accent">
          {values.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 font-mono text-[11px] text-accent"
            >
              {formatTagLabel(tag)}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                disabled={disabled}
                className="text-muted transition-colors hover:text-fg"
              >
                ×
              </button>
            </span>
          ))}
          <input
            id="bf-tags"
            type="text"
            value={tagInput}
            onChange={(e) => handleTagInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && tagInput.trim()) {
                e.preventDefault();
                addTag(tagInput.trim().toLowerCase());
              }
            }}
            onFocus={() => {
              if (tagSuggestions.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={values.tags.length === 0 ? 'Add tags…' : ''}
            disabled={disabled}
            className="min-w-[100px] flex-1 border-none bg-transparent py-1 text-sm text-fg placeholder-muted outline-none disabled:opacity-50"
          />
        </div>
        {showSuggestions && (
          <div className="absolute z-10 mt-1 w-full rounded-[10px] border border-border bg-surface py-1">
            {tagSuggestions.map((tag) => (
              <button
                key={tag}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  addTag(tag);
                }}
                className="w-full px-3.5 py-2.5 text-left text-sm text-muted transition-colors hover:bg-surface-hover hover:text-fg"
              >
                {formatTagLabel(tag)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted">
          Folders
        </label>
        <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-[10px] border border-border bg-bg px-3 py-1.5 focus-within:border-accent">
          {values.folders.map((folder) => (
            <span
              key={folder}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 font-mono text-[11px] text-accent"
            >
              {folder}
              <button
                type="button"
                onClick={() => removeFolder(folder)}
                disabled={disabled}
                className="text-muted transition-colors hover:text-fg"
              >
                ×
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => setShowFolderMenu((v) => !v)}
            onBlur={() => setTimeout(() => setShowFolderMenu(false), 150)}
            disabled={disabled}
            className="min-h-8 flex-1 cursor-pointer border-none bg-transparent py-1 text-left text-sm text-muted outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {values.folders.length === 0 ? 'Select folders…' : 'Add another…'}
          </button>
        </div>
        {showFolderMenu && (
          <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-[10px] border border-border bg-surface py-1">
            {knownFolders.length === 0 ? (
              <p className="px-3.5 py-2.5 text-sm text-muted">
                No folders yet — create one from the Library page.
              </p>
            ) : (
              knownFolders.map((folder) => {
                const selected = values.folders.includes(folder);
                return (
                  <button
                    key={folder}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      toggleFolder(folder);
                    }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-muted transition-colors hover:bg-surface-hover hover:text-fg"
                  >
                    <span
                      className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                        selected ? 'border-accent bg-accent text-bg' : 'border-border'
                      }`}
                      aria-hidden
                    >
                      {selected && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      )}
                    </span>
                    {folder}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="bf-notes" className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted">
          Notes
        </label>
        <textarea
          id="bf-notes"
          value={values.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          rows={2}
          placeholder="Personal notes (optional)"
          disabled={disabled}
          className="input-field resize-none"
        />
      </div>
    </div>
  );
}
