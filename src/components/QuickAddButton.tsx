'use client';

import Link from 'next/link';

export default function QuickAddButton() {
  return (
    <Link
      href="/add"
      title="Add bookmark"
      className="fixed bottom-6 right-6 z-20 flex size-14 cursor-pointer items-center justify-center rounded-[10px] bg-accent text-[#07080c] shadow-lg shadow-black/30 transition-colors duration-200 hover:bg-accent-dim hover:text-fg"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </Link>
  );
}
