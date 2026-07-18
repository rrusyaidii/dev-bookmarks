'use client';

import { useCallback, useState } from 'react';
import { PRESET_TAGS } from '@/data/mock';

export interface BookmarkFormValues {
  url: string;
  title: string;
  description: string;
  tags: string[];
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

  return (
    <div className="space-y-4">
      {showUrl && (
        <div>
          <label htmlFor="bf-url" className="mb-1.5 block text-sm font-medium text-fg">
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
            className="h-10 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-fg placeholder-muted outline-none transition-colors focus:border-accent/40 disabled:opacity-50"
          />
          {urlHint}
        </div>
      )}

      <div>
        <label htmlFor="bf-title" className="mb-1.5 block text-sm font-medium text-fg">
          Title
        </label>
        <input
          id="bf-title"
          type="text"
          value={values.title}
          onChange={(e) => onChange({ title: e.target.value })}
          disabled={disabled}
          className="h-10 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-fg placeholder-muted outline-none transition-colors focus:border-accent/40 disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="bf-desc" className="mb-1.5 block text-sm font-medium text-fg">
          Description
        </label>
        <textarea
          id="bf-desc"
          value={values.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
          disabled={disabled}
          className="w-full resize-none rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-fg placeholder-muted outline-none transition-colors focus:border-accent/40 disabled:opacity-50"
        />
      </div>

      <div className="relative">
        <label htmlFor="bf-tags" className="mb-1.5 block text-sm font-medium text-fg">
          Tags
        </label>
        <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 focus-within:border-accent/40">
          {values.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: '#61dafb20', color: '#61dafb' }}
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                disabled={disabled}
                className="hover:text-fg transition-colors"
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
          <div className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-surface py-1 shadow-xl">
            {tagSuggestions.map((tag) => (
              <button
                key={tag}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  addTag(tag);
                }}
                className="w-full px-3.5 py-2 text-left text-sm text-muted hover:bg-surface-hover hover:text-fg"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="bf-notes" className="mb-1.5 block text-sm font-medium text-fg">
          Notes
        </label>
        <textarea
          id="bf-notes"
          value={values.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          rows={2}
          placeholder="Personal notes (optional)"
          disabled={disabled}
          className="w-full resize-none rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-fg placeholder-muted outline-none transition-colors focus:border-accent/40 disabled:opacity-50"
        />
      </div>
    </div>
  );
}
