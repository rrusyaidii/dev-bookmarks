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
    <div className="mx-auto max-w-2xl space-y-10">
      <div className="signal-enter" style={{ ['--i' as string]: 0 }}>
        <h1 className="font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">Tools</h1>
        <p className="mt-2 text-sm text-muted">
          Backup, restore, retag, and check link health.
        </p>
      </div>

      {message && <p className="font-mono text-xs text-green">{message}</p>}
      {error && <p className="text-sm text-red">{error}</p>}

      <section className="forge-enter space-y-4" style={{ ['--i' as string]: 1 }}>
        <h2 className="forge-section-title font-display text-lg font-bold text-fg">
          Export / Import
        </h2>
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
            className="btn-primary"
          >
            {busy === 'export' ? 'Exporting…' : 'Export JSON'}
          </button>
          <button
            type="button"
            disabled={Boolean(busy)}
            onClick={() => fileRef.current?.click()}
            className="btn-ghost"
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

      <section className="forge-enter space-y-4" style={{ ['--i' as string]: 2 }}>
        <h2 className="forge-section-title font-display text-lg font-bold text-fg">
          AI Retag
        </h2>
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
          className="btn-ghost"
        >
          {busy === 'retag' ? 'Retagging…' : 'Retag all'}
        </button>
      </section>

      <section className="forge-enter space-y-4" style={{ ['--i' as string]: 3 }}>
        <h2 className="forge-section-title font-display text-lg font-bold text-fg">
          Link health
        </h2>
        <p className="text-sm text-muted">
          Check every bookmark URL (HEAD/GET). Flags broken and redirect links.
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
          className="btn-ghost"
        >
          {busy === 'check' ? 'Checking…' : 'Check all links'}
        </button>
      </section>
    </div>
  );
}
