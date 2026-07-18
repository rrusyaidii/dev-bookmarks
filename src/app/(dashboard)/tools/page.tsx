'use client';

import { useRef, useState } from 'react';

export default function ToolsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(label);
    setMessage(null);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-fg">Tools</h1>
        <p className="mt-1 text-sm text-muted">
          Backup, restore, retag, and check link health.
        </p>
      </div>

      {message && <p className="text-sm text-green">{message}</p>}
      {error && <p className="text-sm text-red">{error}</p>}

      <section className="glass space-y-4 rounded-xl p-5">
        <h2 className="text-base font-semibold text-fg">Export / Import</h2>
        <p className="text-sm text-muted">
          Download a JSON backup, or restore bookmarks (upsert by URL).
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={Boolean(busy)}
            onClick={() =>
              run('export', async () => {
                const res = await fetch('/api/bookmarks/export');
                if (!res.ok) {
                  const data = await res.json();
                  throw new Error(data.error || 'Export failed');
                }
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `devmark-backup-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
                setMessage('Export downloaded.');
              })
            }
            className="h-10 rounded-xl bg-accent/15 px-5 text-sm font-semibold text-accent hover:bg-accent/25 disabled:opacity-50"
          >
            {busy === 'export' ? 'Exporting…' : 'Export JSON'}
          </button>
          <button
            type="button"
            disabled={Boolean(busy)}
            onClick={() => fileRef.current?.click()}
            className="h-10 rounded-xl border border-border px-5 text-sm font-medium text-muted hover:bg-surface-hover hover:text-fg disabled:opacity-50"
          >
            {busy === 'import' ? 'Importing…' : 'Import JSON'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              run('import', async () => {
                const text = await file.text();
                const payload = JSON.parse(text);
                const res = await fetch('/api/bookmarks/import', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Import failed');
                setMessage(`Imported ${data.created} new, updated ${data.updated}.`);
              });
              e.target.value = '';
            }}
          />
        </div>
      </section>

      <section className="glass space-y-4 rounded-xl p-5">
        <h2 className="text-base font-semibold text-fg">AI Retag</h2>
        <p className="text-sm text-muted">
          Re-run AI tagging on every bookmark. Uses OpenRouter if configured, otherwise keyword fallback.
        </p>
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => {
            if (!window.confirm('Retag all bookmarks? This may take a while.')) return;
            run('retag', async () => {
              const res = await fetch('/api/bookmarks/retag', { method: 'POST' });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || 'Retag failed');
              setMessage(`Retagged ${data.count} bookmarks.`);
            });
          }}
          className="h-10 rounded-xl border border-border px-5 text-sm font-medium text-muted hover:bg-surface-hover hover:text-fg disabled:opacity-50"
        >
          {busy === 'retag' ? 'Retagging…' : 'Retag all'}
        </button>
      </section>

      <section className="glass space-y-4 rounded-xl p-5">
        <h2 className="text-base font-semibold text-fg">Link health</h2>
        <p className="text-sm text-muted">
          Check every bookmark URL (HEAD/GET). Flags broken and redirect links on cards.
        </p>
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => {
            if (!window.confirm('Check all links now?')) return;
            run('check', async () => {
              const res = await fetch('/api/bookmarks/check-links', { method: 'POST' });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || 'Check failed');
              setMessage(
                `Checked ${data.count}: ${data.ok} ok, ${data.broken} broken, ${data.redirect} redirect.`
              );
            });
          }}
          className="h-10 rounded-xl border border-border px-5 text-sm font-medium text-muted hover:bg-surface-hover hover:text-fg disabled:opacity-50"
        >
          {busy === 'check' ? 'Checking…' : 'Check all links'}
        </button>
      </section>
    </div>
  );
}
