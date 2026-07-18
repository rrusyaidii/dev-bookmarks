'use client';

import Link from 'next/link';

export default function QuickAddButton() {
  return (
    <Link
      href="/add"
      title="Add bookmark"
      className="fixed bottom-6 right-6 z-20 flex size-12 cursor-pointer items-center justify-center border border-accent bg-surface text-accent transition-colors duration-200 hover:bg-accent hover:text-bg"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </Link>
  );
}
