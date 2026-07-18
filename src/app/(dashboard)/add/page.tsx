'use client';

import AddBookmarkForm from '@/components/AddBookmarkForm';

export default function AddBookmarkPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="signal-enter mb-8" style={{ ['--i' as string]: 0 }}>
        <h1 className="font-display text-4xl font-bold tracking-tight text-fg">
          Add bookmark
        </h1>
        <p className="mt-2 text-sm text-muted">
          Paste a URL and we&apos;ll fetch the details — or fill them in manually.
        </p>
      </div>

      <AddBookmarkForm />
    </div>
  );
}
