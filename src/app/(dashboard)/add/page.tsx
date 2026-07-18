'use client';

import AddBookmarkForm from '@/components/AddBookmarkForm';

export default function AddBookmarkPage() {
  return (
    <div className="mx-auto max-w-5xl animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-fg">Add Bookmark</h1>
        <p className="mt-1 text-sm text-muted">
          Paste a URL and let us fetch the details — or fill them in manually.
        </p>
      </div>

      <AddBookmarkForm />
    </div>
  );
}
