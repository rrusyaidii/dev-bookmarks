'use client';

import AddBookmarkForm from '@/components/AddBookmarkForm';

export default function AddBookmarkPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-medium tracking-tight text-fg">
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
