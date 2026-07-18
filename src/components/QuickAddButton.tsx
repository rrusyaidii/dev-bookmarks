'use client';

import Link from 'next/link';

export default function QuickAddButton() {
  return (
    <Link
      href="/add"
      className="fixed bottom-6 right-6 z-20 flex size-14 items-center justify-center rounded-full glass-strong text-accent shadow-lg shadow-accent/10 transition-all duration-200 hover:scale-110 hover:shadow-accent/20"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </Link>
  );
}
